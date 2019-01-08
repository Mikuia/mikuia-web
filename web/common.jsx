const Common = {
	darkReactSelect: {
		control: (provided) => ({
			...provided,
			'&:hover': {
				border: '1px solid #444',
				boxShadow: 'none'
			},
			backgroundColor: '#333',
			border: '1px solid #444',
			boxShadow: 'none'
		}),
		dropdownIndicator: (provided) => ({
			...provided,
			color: 'white'
		}),
		indicatorSeparator: (provided) => ({
			...provided,
			backgroundColor: '#666'
		}),
		menu: (provided) => ({
			...provided,
			backgroundColor: '#333'
		}),
		option: (provided) => ({
			...provided,
			'&:active': {
				backgroundColor: '#222'
			},
			backgroundColor: '#333'
		}),
		singleValue: (provided) => ({
			...provided,
			color: 'white'
		})
	}
}

export default Common;