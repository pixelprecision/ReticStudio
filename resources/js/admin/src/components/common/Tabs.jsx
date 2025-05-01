// src/components/common/Tabs.jsx
import React from 'react';
import PropTypes from 'prop-types';

const Tabs = ({ tabs, activeTab, onChange, className = '' }) => {
	return (
		<div className={`border-b border-gray-200 ${className}`}>
			<nav className="flex -mb-px">
				{tabs.map((tab) => (
					<button
						key={tab.id}
						onClick={() => onChange(tab.id)}
						className={`${
							activeTab === tab.id
							? 'border-blue-500 text-blue-600'
							: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
						} whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm flex items-center`}
						aria-current={activeTab === tab.id ? 'page' : undefined}
					>
						{tab.icon && <span className="mr-2">{tab.icon}</span>}
						{tab.label}
					</button>
				))}
			</nav>
		</div>
	);
};

Tabs.propTypes = {
	tabs: PropTypes.arrayOf(
		PropTypes.shape({
			                id: PropTypes.string.isRequired,
			                label: PropTypes.string.isRequired,
			                icon: PropTypes.node
		                })
	).isRequired,
	activeTab: PropTypes.string.isRequired,
	onChange: PropTypes.func.isRequired,
	className: PropTypes.string
};

export default Tabs;
