// import React, { useState, useEffect } from 'react';
// import { createRoot } from 'react-dom/client';
// import { ImageRoute } from '../package/dist/index.mjs';

// const { createElement: h } = React;

// function FarmingRoute() {
// 	const [points, setPoints] = useState([]);

// 	// Load points data
// 	useEffect(() => {
// 		fetch('./public/Koseki Village.json')
// 			.then(res => res.json())
// 			.then(data => setPoints(data))
// 			.catch(err => console.error('Failed to load points:', err));
// 	}, []);

// 	return h('div', {
// 		style: {
// 			width: '100vw',
// 			height: '100vh',
// 			display: 'flex',
// 			alignItems: 'center',
// 			justifyContent: 'center',
// 			background: '#1a1a1a',
// 			padding: '20px',
// 			boxSizing: 'border-box'
// 		}
// 	},
// 		h('div', {
// 			style: {
// 				width: '100%',
// 				height: '100%',
// 				maxWidth: '100vh',
// 				maxHeight: '100vh',
// 				position: 'relative'
// 			}
// 		},
// 			h(ImageRoute, {
// 				points: points,
// 				sx: { aspectRatio: 1, width: '100%', height: '100%' }
// 			},
// 				h('img', {
// 					src: './public/Koseki Village.png',
// 					alt: 'Koseki Village Map',
// 					style: {
// 						width: '100%',
// 						height: '100%',
// 						position: 'absolute',
// 						objectFit: 'contain',
// 						zIndex: -1
// 					}
// 				})
// 			)
// 		)
// 	);
// }

// // Mount the app
// const root = document.getElementById('root');
// if (root) {
// 	createRoot(root).render(h(FarmingRoute));
// }
