// resources/js/admin/src/components/pageRenderer/components/TopBarComponent.jsx
import React from 'react';
import {Link} from 'react-router-dom';
import MenuRenderComponent from '../../menu/MenuRenderComponent';

const TopBarComponent = ({ settings, menu }) => {
	// Don't render if there's no message and topbar is disabled
	if (!settings?.show_topbar && !settings?.topbar_message) {
		return null;
	}

	// Get badge color class
	const getBadgeColorClass = () => {
		const colorMap = {
			'badge-info': 'bg-blue-100 text-blue-800',
			'badge-success': 'bg-green-100 text-green-800',
			'badge-warning': 'bg-yellow-100 text-yellow-800',
			'badge-error': 'bg-red-100 text-red-800',
			'badge-neutral': 'bg-gray-100 text-gray-800'
		};

		return colorMap[settings?.topbar_badge_color] || 'bg-blue-100 text-blue-800';
	};

	// Split the message into main message and secondary message if there's a pipe
	const hasSecondaryMessage = settings?.topbar_message?.includes('|');
	let mainMessage = settings?.topbar_message || '';
	let secondaryMessage = '';

	if (hasSecondaryMessage) {
		const messageParts = settings.topbar_message.split('|');
		mainMessage = messageParts[0].trim();
		secondaryMessage = messageParts[1].trim();
	}

	return (
		<div className={`w-full bg-gray-800 text-white text-sm py-2 ${settings?.custom_topbar_classes || ''}`}>
			<div className="container mx-auto px-4 flex items-center justify-between">
				<div className="flex items-center space-x-2">
					{mainMessage && (
						<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full ${getBadgeColorClass()}`}>
              {mainMessage}
            </span>
					)}

					{secondaryMessage && (
						<>
							<span className="text-gray-400">|</span>
							<span className="text-gray-200">{secondaryMessage}</span>
						</>
					)}
				</div>

				{menu && (
					<div className="flex items-center">
						<MenuRenderComponent
							menu={menu}
							menuId={menu ? menu.id : null}
							className="flex items-center space-x-4 text-gray-300"
							itemClassName="hover:text-white text-xs"
						/>
					</div>
				)}
			</div>
		</div>
	);
};

export default TopBarComponent;
