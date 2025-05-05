// resources/js/admin/src/components/pageRenderer/components/VideoHeroComponent.jsx
import React, { useEffect, useRef } from 'react';

const VideoHeroComponent = ({
	                            title,
	                            subtitle,
	                            content,
	                            buttonText,
	                            buttonLink,
	                            buttonSecondaryText,
	                            buttonSecondaryLink,
	                            videoSrc,
	                            overlayOpacity = '50',
	                            alignment = 'left',
	                            textColor = 'white',
	                            componentId,
	                            backgroundColor = 'white',
                            }) => {
    // Reference to the video element
    const videoRef = useRef(null);

    // Effect to handle autoplay when videoSrc changes
    useEffect(() => {
        if (videoRef.current && videoSrc) {
            console.log('Video source changed, trying to play:', videoSrc);
            // Force reload the video element
            videoRef.current.load();
            // Try to play the video
            const playPromise = videoRef.current.play();
            
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.error('Error auto-playing video:', error);
                    // Most browsers require user interaction before playing videos with audio
                    // We've set muted, which should allow autoplay, but just in case:
                    if (error.name === 'NotAllowedError') {
                        console.log('Autoplay not allowed, video is muted but still needs user interaction');
                    }
                });
            }
        }
    }, [videoSrc]); // Re-run this effect when videoSrc changes
	// Background color classes
	const bgColorClasses = {
		'white': 'bg-white',
		'light': 'bg-gray-50',
		'dark': 'bg-gray-900',
		'primary': 'bg-blue-600',
		'secondary': 'bg-purple-600',
		'gradient-blue': 'bg-gradient-to-r from-blue-600 to-indigo-600',
		'gradient-green': 'bg-gradient-to-r from-green-500 to-teal-500'
	};

	// Text color classes
	const textColorClasses = {
		'white': 'text-white',
		'gray-900': 'text-gray-900',
		'blue-600': 'text-blue-600'
	};

	// Overlay opacity classes
	const overlayOpacityClasses = {
		'30': 'bg-opacity-30',
		'50': 'bg-opacity-50',
		'70': 'bg-opacity-70',
		'90': 'bg-opacity-90'
	};

	// Text alignment classes
	const alignmentClasses = {
		'left': 'text-left',
		'center': 'text-center',
		'right': 'text-right'
	};

	// Content alignment for the layout
	const contentAlignmentClasses = {
		'left': 'justify-start',
		'center': 'justify-center',
		'right': 'justify-end'
	};

	// Function to create markup for HTML content
	const createMarkup = (content) => {
		return { __html: content };
	};

	let backgroundColorClass = null;
	if (backgroundColor) {
		backgroundColorClass = backgroundColor ? bgColorClasses[backgroundColor] : 'bg-white';
	}

	return (

		<section id={componentId} className="relative overflow-hidden" style={{ background: "linear-gradient(to right, rgba(59, 130, 246, 0.05), rgba(99, 102, 241, 0.1))" }}>

			{/* Video Background */}
			<div className={`absolute top-0 right-0 w-full h-full overflow-hidden z-0 ${backgroundColorClass}`}>
				<div className="absolute top-0 right-0 w-full md:w-1/2 h-full z-10">
					<div
						className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-white via-white to-transparent z-20"
						style={{ "--tw-gradient-from-position": "-101%" }}
					></div>
					<div
						className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-white to-transparent z-10"
						style={{ "--tw-gradient-from-position": "-101%" }}
					></div>
					<video
						ref={videoRef}
						className="absolute top-0 right-0 min-w-full min-h-full object-cover"
						autoPlay
						loop
						muted
						playsInline
						key={videoSrc} // Add key to force re-render when source changes
					>
						<source src={videoSrc} type="video/mp4"/>
						Your browser does not support the video tag.
					</video>

				</div>
			</div>

			{/* Content */}
			<div className="relative z-10 py-20 md:py-32">
				<div className="container mx-auto px-4 md:px-6 lg:px-8">
					<div className={`flex ${contentAlignmentClasses[alignment] || 'justify-start'}`}>
						<div className={`w-full max-w-3xl ${alignmentClasses[alignment] || 'text-left'}`}>
							{title && (
								<div
									className={`text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 ${textColorClasses[textColor] || 'text-white'}`}
									dangerouslySetInnerHTML={createMarkup(title)}
								/>
							)}

							{subtitle && (
								<h2 className={`text-xl md:text-2xl font-medium mb-6 ${textColor === 'white' ? 'text-gray-200' : 'text-gray-600'}`}>
									{subtitle}
								</h2>
							)}

							{content && (
								<div
									className={`prose prose-lg max-w-none mb-8 ${textColor === 'white' ? 'text-gray-200 prose-headings:text-white prose-a:text-blue-300' : 'text-gray-600'}`}
									dangerouslySetInnerHTML={createMarkup(content)}
								/>
							)}

							<div className="mt-8 flex flex-wrap gap-4">
								{buttonText && buttonLink && (
									<a
										href={buttonLink}
										className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-8 rounded-full font-medium transition duration-300"
									>
										{buttonText}
									</a>
								)}

								{buttonSecondaryText && buttonSecondaryLink && (
									<a
										href={buttonSecondaryLink}
										className="bg-white hover:bg-gray-100 text-gray-900 py-3 px-8 rounded-full font-medium transition duration-300"
									>
										{buttonSecondaryText}
									</a>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default VideoHeroComponent;
