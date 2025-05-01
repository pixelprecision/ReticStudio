<?php
	// app/Http/Controllers/Api/FormSubmissionController.php
	
	namespace App\Http\Controllers\Api;
	
	use App\Http\Controllers\Controller;
	use App\Models\Form;
	use App\Models\FormSubmission;
	use Illuminate\Http\Request;
	use Illuminate\Support\Facades\Mail;
	use Illuminate\Support\Facades\Validator;
	
	class FormSubmissionController extends Controller
	{
		public function __construct()
		{
		
		}
		
		public function index(Request $request, $formId)
		{
			$form = Form::findOrFail($formId);
			
			$query = $form->submissions();
			
			if ($request->has('is_spam')) {
				$query->where('is_spam', $request->boolean('is_spam'));
			}
			
			$submissions = $query->orderBy('created_at', 'desc')
			                     ->paginate($request->input('per_page', 15));
			
			return response()->json($submissions);
		}
		
		public function show($formId, $id)
		{
			$form = Form::findOrFail($formId);
			$submission = $form->submissions()->findOrFail($id);
			
			return response()->json($submission);
		}
		
		public function submit(Request $request, $slug)
		{
			$form = Form::where('slug', $slug)
			            ->where('is_active', true)
			            ->firstOrFail();
			
			// Apply validation rules if they exist
			if (!empty($form->validation_rules)) {
				$validator = Validator::make($request->all(), $form->validation_rules);
				
				if ($validator->fails()) {
					return response()->json(['errors' => $validator->errors()], 422);
				}
			}
			
			// Check for CAPTCHA if enabled
			if ($form->enable_captcha) {
				$captchaValidator = Validator::make($request->all(), [
					'captcha_token' => 'required|string',
				]);
				
				if ($captchaValidator->fails()) {
					return response()->json(['errors' => ['captcha' => 'CAPTCHA verification failed']], 422);
				}
				
				// Here you would add your CAPTCHA verification logic
				// For example, if using Google reCAPTCHA:
				// $recaptcha = new \ReCaptcha\ReCaptcha(config('services.recaptcha.secret_key'));
				// $resp = $recaptcha->verify($request->captcha_token, $request->ip());
				// if (!$resp->isSuccess()) {
				//     return response()->json(['errors' => ['captcha' => 'CAPTCHA verification failed']], 422);
				// }
			}
			
			// Store the submission if enabled
			if ($form->store_submissions) {
				$submission = new FormSubmission([
					'form_id' => $form->id,
					'data' => $request->except('captcha_token'),
					'ip_address' => $request->ip(),
					'user_agent' => $request->header('User-Agent'),
					'is_spam' => false, // You could implement spam detection logic here
				]);
				
				$submission->save();
			}
			
			// Send notification if enabled
			if ($form->send_notifications && !empty($form->notification_emails)) {
				$this->sendNotification($form, $request->except('captcha_token'));
			}
			
			return response()->json(['message' => 'Form submitted successfully'], 201);
		}
		
		public function markAsSpam($formId, $id)
		{
			$form = Form::findOrFail($formId);
			$submission = $form->submissions()->findOrFail($id);
			
			$submission->update(['is_spam' => true]);
			
			return response()->json(['message' => 'Submission marked as spam']);
		}
		
		public function markAsNotSpam($formId, $id)
		{
			$form = Form::findOrFail($formId);
			$submission = $form->submissions()->findOrFail($id);
			
			$submission->update(['is_spam' => false]);
			
			return response()->json(['message' => 'Submission marked as not spam']);
		}
		
		public function destroy($formId, $id)
		{
			$form = Form::findOrFail($formId);
			$submission = $form->submissions()->findOrFail($id);
			
			$submission->delete();
			
			return response()->json(['message' => 'Submission deleted successfully']);
		}
		
		public function export($formId, Request $request)
		{
			$form = Form::findOrFail($formId);
			
			$query = $form->submissions();
			
			if ($request->has('is_spam')) {
				$query->where('is_spam', $request->boolean('is_spam'));
			}
			
			$submissions = $query->orderBy('created_at', 'desc')->get();
			
			// Determine export format
			$format = $request->input('format', 'csv');
			
			switch ($format) {
				case 'json':
					return response()->json($submissions);
				
				case 'csv':
				default:
					$headers = [
						'Content-Type' => 'text/csv',
						'Content-Disposition' => 'attachment; filename="' . $form->slug . '-submissions.csv"',
					];
					
					$callback = function() use ($submissions, $form) {
						$file = fopen('php://output', 'w');
						
						// Get all possible field keys from the form schema
						$fieldKeys = collect($form->schema)->pluck('name')->toArray();
						
						// Add metadata columns
						$headers = array_merge(['id', 'created_at', 'ip_address', 'is_spam'], $fieldKeys);
						fputcsv($file, $headers);
						
						foreach ($submissions as $submission) {
							$row = [
								$submission->id,
								$submission->created_at,
								$submission->ip_address,
								$submission->is_spam ? 'Yes' : 'No',
							];
							
							// Add the data fields
							foreach ($fieldKeys as $key) {
								$row[] = $submission->data[$key] ?? '';
							}
							
							fputcsv($file, $row);
						}
						
						fclose($file);
					};
					
					return response()->stream($callback, 200, $headers);
			}
		}
		
		protected function sendNotification(Form $form, array $data)
		{
			$emails = explode(',', $form->notification_emails);
			$emails = array_map('trim', $emails);
			
			// If a notification template exists, use it
			$template = $form->notification_template;
			
			// Otherwise, build a simple default template
			if (empty($template)) {
				$template = "New submission for form: {{ form_name }}\n\n";
				$template .= "Submission details:\n";
				$template .= "{{ submission_details }}";
			}
			
			// Replace placeholders with actual data
			$template = str_replace('{{ form_name }}', $form->name, $template);
			
			// Build submission details
			$details = '';
			foreach ($data as $key => $value) {
				if (is_array($value)) {
					$value = implode(', ', $value);
				}
				$details .= "$key: $value\n";
			}
			
			$template = str_replace('{{ submission_details }}', $details, $template);
			
			// Send email
			foreach ($emails as $email) {
				if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
					// Here you would implement your email sending logic
					// For example, using Laravel's Mail facade:
					// Mail::raw($template, function ($message) use ($form, $email) {
					//     $message->to($email)
					//         ->subject("New submission: {$form->name}");
					// });
				}
			}
		}
	}
