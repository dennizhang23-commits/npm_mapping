import React, { useState, useEffect, Fragment, useMemo, useCallback, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import styled from 'styled-components';
import { ImageRoute, calculateOptimalZoom, useRouteVideoSync } from "../package/dist/index.mjs";

const { createElement: h } = React;

// Styled components for RatioContainer
const OuterContainer = styled.div`
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	${props => props.$sx || ''}
`;

const InnerContainer = styled.div`
	aspect-ratio: ${props => props.$width} / ${props => props.$height};
	width: min(100%, ${props => props.$calculatedWidth}px);
	height: min(100%, ${props => props.$calculatedHeight}px);
	position: relative;
`;

// Custom hook for measuring element dimensions
function useMeasure() {
	const ref = useRef(null);
	const [measurements, setMeasurements] = useState({
		outerWidth: 0,
		outerHeight: 0
	});

	useEffect(() => {
		if (!ref.current) return;

		const updateMeasurements = () => {
			if (ref.current) {
				const rect = ref.current.getBoundingClientRect();
				setMeasurements({
					outerWidth: rect.width,
					outerHeight: rect.height
				});
			}
		};

		updateMeasurements();

		const resizeObserver = new ResizeObserver(updateMeasurements);
		resizeObserver.observe(ref.current);

		return () => resizeObserver.disconnect();
	}, []);

	return [ref, measurements];
}

export default function RatioContainer({ width, height, sx, ...props }) {
	const [containerRef, measurements] = useMeasure();

	const calculatedWidth = (measurements.outerHeight * width) / height;
	const calculatedHeight = (measurements.outerWidth * height) / width;

	return h(OuterContainer, {
		ref: containerRef,
		$sx: sx
	},
		h(InnerContainer, {
			$width: width,
			$height: height,
			$calculatedWidth: calculatedWidth,
			$calculatedHeight: calculatedHeight,
			...props
		})
	);
}


function FarmingRoute() {
	const [points, setPoints] = useState([]);
	// const [selectedMap, setSelectedMap] = useState(0);

	const mapName = 'Koseki Village';

	// Load points data
	useEffect(() => {
		fetch('./public/Koseki Village.json')
			.then(res => res.json())
			.then(data => setPoints(data))
			.catch(err => console.error('Failed to load points:', err));
	}, []);

	// Use video sync hook
	const { routeRef, videoRef, time, activeSpot, setActiveSpot } = useRouteVideoSync(points, true);

	// Calculate spots collected at current time
	const spots = useMemo(
		() => points?.filter(({ marked }) => (!marked ? false : time >= marked)).length ?? 0,
		[points, time]
	);
	// const spots = 0;

	const totalSpots = points?.filter(({ marked }) => marked !== undefined).length ?? 0;

	// Render extra elements (arrows, text labels)
	const RenderExtra = useCallback(({ containerSize }) => {
		return h(Fragment, null,
			h('defs', null,
				h('style', null, `
					@keyframes pulse {
						0%, 100% {
							opacity: 1;
							transform: scale(1);
						}
						50% {
							opacity: 0.75;
							transform: scale(1.5);
						}
					}
				`),
				h('marker', {
					id: 'arrowhead',
					markerWidth: 8,
					markerHeight: 8,
					refX: 3.3,
					refY: 2.5,
					orient: 'auto'
				},
					h('polygon', {
						points: '0 0, 5 2.5, 0 5',
						fill: '#ff0000'
					})
				)
			)
		);
	}, []);

	// Render path lines
	const RenderPath = useCallback(({ point1, point2, containerSize, scale }) => {
		if (point2.data === 'hidden') return null;
		scale = scale / 4 + 0.75;

		const x1 = point1.x * containerSize.width;
		const y1 = point1.y * containerSize.height;
		let x2 = point2.x * containerSize.width;
		let y2 = point2.y * containerSize.height;

		const arrowOffset = 3 / scale;

		if (point2.marked) {
			const dx = x2 - x1;
			const dy = y2 - y1;
			const length = Math.sqrt(dx * dx + dy * dy);

			if (!length) return null;

			if (length > arrowOffset) {
				x2 = x2 - (dx / length) * arrowOffset;
				y2 = y2 - (dy / length) * arrowOffset;
			}
		}

		return h('line', {
			x1: x1,
			y1: y1,
			x2: x2,
			y2: y2,
			stroke: 'red',
			strokeWidth: containerSize.width / 250 / scale,
			strokeDasharray: point2.data === 'jump' ? '5 10' : undefined,
			markerEnd: point2.marked && 'url(#arrowhead)'
		});
	}, []);

	// Render points/circles
	const RenderPoint = useCallback(({ point, containerSize, scale, type }) => {
		if (!type) return null;

		const fillColor = { active: 'blue', hover: 'lime' }[type];
		const strokeColor = { active: 'blue', hover: 'lime' }[type];

		return h('circle', {
			cx: point.x * containerSize.width,
			cy: point.y * containerSize.height,
			r: containerSize.width / (type ? 75 : 500 * scale),
			fill: fillColor,
			fillOpacity: type ? 0.5 : 1,
			stroke: strokeColor,
			strokeWidth: containerSize.width / 500,
			style: {
				transformOrigin: `${point.x * containerSize.width}px ${point.y * containerSize.height}px`,
				animation: type === 'active' ? 'pulse 2s ease-in-out infinite' : undefined,
			}
		});
	}, []);

	return h('div', {
		style: {
			display: 'flex',
			width: '100vw',
			height: '100vh',
			margin: 0,
			padding: 0,
			backgroundColor: '#0f0f0f',
			fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
		}
	},
		// Left side - Video
		h('div', {
			style: {
				width: '40%',
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
				backgroundColor: '#1a1a1a',
				padding: '20px',
				gap: '15px'
			}
		},
			// Info header
			h('div', {
				style: {
					display: 'flex',
					flexDirection: 'column',
					gap: '10px',
					paddingBottom: '15px',
					borderBottom: '1px solid #333'
				}
			},
				h('h1', {
					style: {
						color: '#fff',
						margin: 0,
						fontSize: '1.5rem',
						fontWeight: '600'
					}
				}, mapName),
				h('div', {
					style: {
						display: 'flex',
						alignItems: 'center',
						gap: '15px'
					}
				},
					h('div', {
						style: {
							display: 'flex',
							alignItems: 'baseline',
							gap: '8px'
						}
					},
						h('span', {
							style: {
								color: '#4CAF50',
								fontSize: '2rem',
								fontWeight: '700'
							}
						}, `${spots}`),
						h('span', {
							style: {
								color: '#888',
								fontSize: '1rem'
							}
						}, `/ ${totalSpots}`)
					),
					h('span', {
						style: {
							color: '#aaa',
							fontSize: '0.9rem'
						}
					}, 'spots collected')
				)
			),

			// Video player
			h('div', {
				style: {
					flex: 1,
					backgroundColor: '#000',
					borderRadius: '8px',
					overflow: 'hidden',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center'
				}
			},
				h('video', {
					ref: videoRef,
					src: './public/Koseki Village.mp4',
					controls: true,
					style: {
						width: '100%',
						height: '100%',
						objectFit: 'contain'
					}
				})
			)
		),

		// Right side - Route map
		h('div', {
			style: {
				width: '60%',
				height: '100%',
				position: 'relative',
				backgroundColor: '#0a0a0a',
				borderLeft: '2px solid #333'
			}
		},
		h(RatioContainer, {
			width: 1,
			height: 1,
			sx: { height: 'calc(100vh - 50px)' }
		},
			h(ImageRoute, {
				routeRef: routeRef,
				points: points,
				activeSpot: activeSpot,
				setActiveSpot: setActiveSpot,
				style: { width: '100%', height: '100%', position: 'relative', aspectRatio: '1'},
				getInitialPosition: (containerSize) => calculateOptimalZoom(points, containerSize, 0.9, 2),
				// RenderPath: RenderPath,
				// RenderPoint: RenderPoint,
				// RenderExtra: RenderExtra
			},
				h('img', {
					src: './public/Koseki Village.png',
					alt: mapName,
					style: {
						width: '100%',
						height: '100%',
						objectFit: 'contain',
						pointerEvents: 'none',
						position: 'absolute',
						top: 0,
						left: 0,
						zIndex: -1
					}
				})
			)
		)
	)
);

}

// Mount the app
const root = document.getElementById('root');
if (root) {
	createRoot(root).render(h(FarmingRoute));
}
