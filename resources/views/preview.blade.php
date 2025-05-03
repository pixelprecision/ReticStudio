<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Retic Laravel Studio</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700&display=swap" rel="stylesheet">
     <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    @viteReactRefresh
    @vite('resources/js/admin/src/index.js')
    <script>
        // Pass the isHomePage flag to the frontend
        window.isHomePage = {{ isset($isHomePage) && $isHomePage ? 'true' : 'false' }};
    </script>
</head>
<body class="font-sans antialiased bg-gray-100">
    <div id="root"></div>
</body>
</html>
