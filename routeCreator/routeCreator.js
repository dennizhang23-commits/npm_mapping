import React, { useState, useEffect, useCallback, useRef, Fragment } from 'react';
import { createRoot } from 'react-dom/client';
import { ImageRoute, useRouteVideoSync } from "../package/dist/index.mjs";
import {
	AppContainer,
	Header,
	Title,
	Subtitle,
	MainLayout,
	LeftColumn,
	RightColumn,
	Section,
	SectionTitle,
	Button,
	MapContainer,
	FileInput,
	FileLabel,
	FileName,
	VideoElement,
	Input,
	Select,
	Label,
	FormGroup,
	ButtonGroup,
	SmallButton,
	PointListContainer,
	PointItem,
	KeyboardHint,
	FileUploadGroup,
	CompactFileUpload,
	SwitchContainer,
	Switch,
	SwitchLabel
} from './styledComponents.js';

const { createElement: h } = React;

// ===== Component Functions =====

function CompactFileUploadComponent({ label, accept, onFileSelect, currentFileName }) {
	const inputId = `file-${label.replace(/\s+/g, '-')}`;

	const handleChange = (e) => {
		const file = e.target.files?.[0];
		if (file) {
			onFileSelect(file);
		}
	};

	return h(CompactFileUpload, null,
		h('label', { htmlFor: inputId }, label + ':'),
		h(FileInput, {
			id: inputId,
			type: 'file',
			accept,
			onChange: handleChange
		}),
		h(FileLabel, {
			htmlFor: inputId,
			style: {
				padding: '6px 12px',
				fontSize: '0.85rem',
				display: 'inline-block',
				minWidth: 'auto'
			}
		}, currentFileName || 'Choose file')
	);
}

function MapEditor({ imageSrc, points, selectedPointIndex, activeSpot, routeRef, setActiveSpot, onAddPoint, onUpdatePoint }) {

	const handleClick = (e) => {
		if (!imageSrc) return;

		const rect = e.currentTarget.getBoundingClientRect();
		const x = (e.clientX - rect.left) / rect.width;
		const y = (e.clientY - rect.top) / rect.height;

		const newPoint = { x, y };
		const isShiftClick = e.shiftKey;
		const isCtrlClick = e.ctrlKey || e.metaKey;
		onAddPoint(newPoint, isShiftClick, isCtrlClick);
	};

	// Render extra elements (arrows, selected point indicator, etc)
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
			),
			// Render orange circle for selected point being edited
			selectedPointIndex !== null && points[selectedPointIndex] && h('circle', {
				cx: points[selectedPointIndex].x * containerSize.width,
				cy: points[selectedPointIndex].y * containerSize.height,
				r: containerSize.width / 75,
				fill: 'orange',
				fillOpacity: 0.5,
				stroke: 'orange',
				strokeWidth: containerSize.width / 500
			})
		);
	}, [selectedPointIndex, points]);

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
	const RenderPoint = useCallback(({ point, containerSize, type }) => {
		// Don't render hover circles
		if (!type || type === 'hover') return null;

		const fillColor = { active: 'blue', selected: 'orange' }[type];
		const strokeColor = { active: 'blue', selected: 'orange' }[type];

		return h('circle', {
			cx: point.x * containerSize.width,
			cy: point.y * containerSize.height,
			r: containerSize.width / 75,
			fill: fillColor,
			fillOpacity: 0.5,
			stroke: strokeColor,
			strokeWidth: containerSize.width / 500,
			style: {
				transformOrigin: `${point.x * containerSize.width}px ${point.y * containerSize.height}px`,
				animation: type === 'active' ? 'pulse 2s ease-in-out infinite' : undefined,
			}
		});
	}, []);

	if (!imageSrc) {
		return h(MapContainer, {
			$hasImage: false
		},
			h('div', {
				style: {
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					height: '100%',
					color: '#999'
				}
			}, 'Upload a map image to begin')
		);
	}

	return h(MapContainer, {
		onClick: handleClick,
		$hasImage: true
	},
		h(ImageRoute, {
			routeRef: routeRef,
			points: points,
			activeSpot: activeSpot,
			setActiveSpot: setActiveSpot,
			style: { width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 },
			RenderPath: RenderPath,
			RenderPoint: RenderPoint,
			RenderExtra: RenderExtra
		},
			h('img', {
				src: imageSrc,
				alt: 'Map',
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
	);
}

function VideoControls({ videoSrc, videoRef }) {
	// Update video src when it changes
	useEffect(() => {
		if (videoRef.current && videoSrc) {
			videoRef.current.src = videoSrc;
			videoRef.current.load();
		}
	}, [videoSrc, videoRef]);

	// Always render video element (needed for useVideo hook)
	return h(VideoElement, {
		ref: videoRef,
		controls: true,
		style: { display: videoSrc ? 'block' : 'none' }
	});
}

function PointEditor({ point, pointIndex, totalPoints, currentVideoTime, onUpdatePoint, onDeletePoint, onNavigate }) {
	if (!point || pointIndex === null) {
		return h('div', { style: { padding: '20px', textAlign: 'center', color: '#999' } },
			'Select a point to edit'
		);
	}

	return h('div', null,
		h(FormGroup, null,
			h(Label, null, `Point ${pointIndex + 1} of ${totalPoints}`),
			h(ButtonGroup, null,
				h(SmallButton, {
					disabled: pointIndex === 0,
					onClick: () => onNavigate(pointIndex - 1)
				}, '← Previous'),
				h(SmallButton, {
					disabled: pointIndex === totalPoints - 1,
					onClick: () => onNavigate(pointIndex + 1)
				}, 'Next →')
			)
		),

		h(FormGroup, null,
			h(Label, null, `Position: (${point.x.toFixed(3)}, ${point.y.toFixed(3)})`),
		),

		h(FormGroup, null,
			h(Label, null, 'Timestamp (marked)'),
			h('div', { style: { display: 'flex', gap: '8px' } },
				h(Input, {
					type: 'number',
					step: '0.1',
					value: point.marked ?? '',
					onChange: (e) => {
						const val = e.target.value;
						onUpdatePoint(pointIndex, {
							marked: val === '' ? undefined : parseFloat(val)
						});
					},
					placeholder: 'Time in seconds'
				}),
				h(SmallButton, {
					onClick: () => onUpdatePoint(pointIndex, { marked: currentVideoTime }),
					style: { whiteSpace: 'nowrap' }
				}, 'Set Current')
			)
		),

		h(FormGroup, null,
			h(Label, null, 'Start Time'),
			h('div', { style: { display: 'flex', gap: '8px' } },
				h(Input, {
					type: 'number',
					step: '0.1',
					value: point.start ?? '',
					onChange: (e) => {
						const val = e.target.value;
						onUpdatePoint(pointIndex, {
							start: val === '' ? undefined : parseFloat(val)
						});
					},
					placeholder: 'Optional'
				}),
				h(SmallButton, {
					onClick: () => onUpdatePoint(pointIndex, { start: currentVideoTime }),
					style: { whiteSpace: 'nowrap' }
				}, 'Set Current')
			)
		),

		h(FormGroup, null,
			h(Label, null, 'End Time'),
			h('div', { style: { display: 'flex', gap: '8px' } },
				h(Input, {
					type: 'number',
					step: '0.1',
					value: point.end ?? '',
					onChange: (e) => {
						const val = e.target.value;
						onUpdatePoint(pointIndex, {
							end: val === '' ? undefined : parseFloat(val)
						});
					},
					placeholder: 'Optional'
				}),
				h(SmallButton, {
					onClick: () => onUpdatePoint(pointIndex, { end: currentVideoTime }),
					style: { whiteSpace: 'nowrap' }
				}, 'Set Current')
			)
		),

		h(FormGroup, null,
			h(Label, null, 'Data'),
			h(Select, {
				value: point.data ?? '',
				onChange: (e) => {
					const val = e.target.value;
					onUpdatePoint(pointIndex, {
						data: val === '' ? undefined : val
					});
				}
			},
				h('option', { value: '' }, 'None'),
				h('option', { value: 'hidden' }, 'Hidden'),
				h('option', { value: 'jump' }, 'Jump (dashed line)')
			)
		),

		h(SmallButton, {
			$variant: 'danger',
			onClick: () => onDeletePoint(pointIndex)
		}, 'Delete Point')
	);
}

function PointList({ points, selectedPointIndex, onSelectPoint }) {
	const markedCount = React.useMemo(
		() => points.filter(p => p?.marked !== undefined && Number.isFinite(p.marked)).length,
		[points]
  	);

	if (points.length === 0) {
		return h('div', null,
			h(SectionTitle, null, `Points (0)`),
			h('div', { style: { padding: '20px', textAlign: 'center', color: '#999' } },
				'No points added yet'
			)
		);
	}

	return h('div', null,
		h(SectionTitle, null, `Points (${points.length})  Marked (${markedCount})`),
		h(PointListContainer, null,
			points.map((point, index) =>
				h(PointItem, {
					key: index,
					$selected: index === selectedPointIndex,
					onClick: () => onSelectPoint(index)
				},
					`Point ${index + 1}: (${point.x.toFixed(3)}, ${point.y.toFixed(3)})` +
					(point.marked !== undefined ? ` @ ${point.marked.toFixed(1)}s` : '')
				)
			)
		)
	);
}

function ExportButton({ points }) {
	const handleExport = () => {
		const cleanedPoints = points.map(point => {
			const { x, y, marked, start, end, data } = point;
			const cleanPoint = { x, y };
			if (marked !== undefined) cleanPoint.marked = marked;
			if (start !== undefined) cleanPoint.start = start;
			if (end !== undefined) cleanPoint.end = end;
			if (data !== undefined) cleanPoint.data = data;
			return cleanPoint;
		});

		const jsonString = JSON.stringify(cleanedPoints, null, 2);
		const blob = new Blob([jsonString], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = 'route-data.json';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	};

	return h(Button, {
		onClick: handleExport,
		disabled: points.length === 0
	}, `Export JSON (${points.length} points)`);
}

function ImportButton({ onImport }) {
	const inputRef = useRef(null);

	const handleClick = () => {
		inputRef.current?.click();
	};

	const handleChange = (e) => {
		const file = e.target.files?.[0];
		if (file) {
			onImport(file);
		}
	};

	return h(Fragment, null,
		h(Button, {
			onClick: handleClick,
			style: { backgroundColor: '#2e7d32' }
		}, 'Import JSON'),
		h('input', {
			ref: inputRef,
			type: 'file',
			accept: '.json,application/json',
			onChange: handleChange,
			style: { display: 'none' }
		})
	);
}

// ===== Main App =====

function RouteCreator() {
	const [mapImageSrc, setMapImageSrc] = useState(null);
	const [mapFileName, setMapFileName] = useState('');
	const [videoSrc, setVideoSrc] = useState(null);
	const [videoFileName, setVideoFileName] = useState('');
	const [points, setPoints] = useState([]);
	const [selectedPointIndex, setSelectedPointIndex] = useState(null);
	const [history, setHistory] = useState([]);  // History of point changes from click functions
	const [usePresets, setUsePresets] = useState(true);

	// Use video sync hook for automatic video-to-map synchronization
	const { routeRef, videoRef, time, activeSpot, setActiveSpot } = useRouteVideoSync(points);

	// Load Seiraimaru preset data (map, video, and route) when usePresets is turned ON
	useEffect(() => {
		if (usePresets) {
			// Load map image
			setMapImageSrc('../public/Seiraimaru.png');
			setMapFileName('Seiraimaru.png');

			// Load video
			setVideoSrc('../public/Seiraimaru.mp4');
			setVideoFileName('Seiraimaru.mp4');

			// Load route data
			fetch('../public/Seiraimaru.json')
				.then(response => response.json())
				.then(data => {
					if (Array.isArray(data)) {
						setPoints(data);
						setSelectedPointIndex(data.length > 0 ? 0 : null);
					}
				})
				.catch(error => {
					console.error('Failed to load Seiraimaru preset:', error);
				});
		} else {
			// Clear everything when usePresets is turned OFF
			setMapImageSrc(null);
			setMapFileName('');
			setVideoSrc(null);
			setVideoFileName('');
			setPoints([]);
			setSelectedPointIndex(null);
			setHistory([]);
		}
	}, [usePresets]);

	// Override activeSpot to use marked time logic
	const computedActiveSpot = React.useMemo(() => {
		if (!points?.length || time === 0) return null;

		// Find the last point whose marked time has been reached
		let lastMarkedIndex = -1;
		for (let i = 0; i < points.length; i++) {
			if (points[i].marked !== undefined && time >= points[i].marked) {
				lastMarkedIndex = i;
			}
		}

		if (lastMarkedIndex === -1) return null;

		return {
			point: points[lastMarkedIndex],
			pointIndex: lastMarkedIndex,
			percentage: 0
		};
	}, [points, time]);

	const currentMarked = React.useMemo(() => {
		const tNow = time; // from useRouteVideoSync
		if (!Array.isArray(points) || typeof tNow !== "number" || !Number.isFinite(tNow)) return 0;

		let count = 0;
		for (let i = 0; i < points.length; i++) {
			if (points[i].marked !== undefined && time >= points[i].marked) {
				count++;
			}
		}
		return count;
	}, [points, time]);


	const handleMapUpload = (file) => {
		const url = URL.createObjectURL(file);
		setMapImageSrc(url);
		setMapFileName(file.name);
	};

	const handleVideoUpload = (file) => {
		const url = URL.createObjectURL(file);
		setVideoSrc(url);
		setVideoFileName(file.name);
	};

	const handleImportJSON = (file) => {
		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const jsonData = JSON.parse(e.target.result);
				if (Array.isArray(jsonData)) {
					setPoints(jsonData);
					setSelectedPointIndex(jsonData.length > 0 ? 0 : null);
				} else {
					alert('Invalid JSON format. Expected an array of points.');
				}
			} catch (error) {
				alert('Failed to parse JSON file: ' + error.message);
			}
		};
		reader.readAsText(file);
	};

	const handleAddPoint = useCallback((newPoint, isShiftClick = false, isCtrlClick = false) => {
		const { x, y } = newPoint;

		// If ctrl-click and a point is selected, move that point's coordinates
		if (isCtrlClick && selectedPointIndex !== null) {
			setPoints(prevPoints => {
				// Save previous state to history
				setHistory(prev => [...prev, {
					type: 'relocate',
					pointIndex: selectedPointIndex,
					oldPoint: { ...prevPoints[selectedPointIndex] },
					points: [...prevPoints]
				}]);

				const newPoints = [...prevPoints];
				newPoints[selectedPointIndex] = { ...newPoints[selectedPointIndex], x, y };
				return newPoints;
			});
			return;
		}

		setPoints(prevPoints => {
			const cleanPoint = { x, y };

			// If shift-click and a point is selected, insert after selected point
			if (isShiftClick && selectedPointIndex !== null) {
				const insertIndex = selectedPointIndex + 1;
				const newPoints = [
					...prevPoints.slice(0, insertIndex),
					cleanPoint,
					...prevPoints.slice(insertIndex)
				];

				// Save to history
				setHistory(prev => [...prev, {
					type: 'insert',
					insertIndex,
					points: [...prevPoints]
				}]);

				setSelectedPointIndex(insertIndex);
				return newPoints;
			}

			// Otherwise, add to the end
			const newPoints = [...prevPoints, cleanPoint];

			// Save to history
			setHistory(prev => [...prev, {
				type: 'add',
				points: [...prevPoints]
			}]);

			setSelectedPointIndex(prevPoints.length);
			return newPoints;
		});
	}, [selectedPointIndex]);

	const handleUpdatePoint = useCallback((index, updates) => {
		setPoints(prevPoints => {
			const newPoints = [...prevPoints];
			newPoints[index] = { ...newPoints[index], ...updates };
			return newPoints;
		});
	}, []);

	const handleDeletePoint = useCallback((index) => {
		setPoints(prevPoints => {
			const newPoints = prevPoints.filter((_, i) => i !== index);

			// Determine new selected point after deletion
			if (newPoints.length === 0) {
				setSelectedPointIndex(null);
			} else if (index === selectedPointIndex) {
				// Deleted the current point: try next, fallback to previous
				if (index < newPoints.length) {
					setSelectedPointIndex(index); // Next point (same index after deletion)
				} else {
					setSelectedPointIndex(newPoints.length - 1); // Last point
				}
			} else if (index < selectedPointIndex) {
				// Deleted a point before the selected one: shift index down
				setSelectedPointIndex(selectedPointIndex - 1);
			}
			// If deleted after selected point, selectedPointIndex stays the same

			return newPoints;
		});
	}, [selectedPointIndex]);


	const handleUndo = useCallback(() => {
		if (history.length === 0) return;

		const lastAction = history[history.length - 1];

		// Restore points from history
		setPoints(lastAction.points);

		// Restore selected point index based on action type
		if (lastAction.type === 'relocate') {
			setSelectedPointIndex(lastAction.pointIndex);
		} else if (lastAction.type === 'insert') {
			// After undoing insert, select the point that was previously selected
			setSelectedPointIndex(lastAction.insertIndex - 1 >= 0 ? lastAction.insertIndex - 1 : null);
		} else if (lastAction.type === 'add') {
			// After undoing add, select the last point if there is one
			setSelectedPointIndex(lastAction.points.length > 0 ? lastAction.points.length - 1 : null);
		}

		// Remove last action from history
		setHistory(prev => prev.slice(0, -1));
	}, [history]);

	useEffect(() => {
		const handleKeyDown = (e) => {
			const el = e.target;
			const tag = el?.tagName;

			// Only skip when typing in form fields / contenteditable
			const isTypingTarget =
			tag === 'INPUT' ||
			tag === 'TEXTAREA' ||
			tag === 'SELECT';

			// SPACE toggles video play/pause (capture-phase prevents page scroll reliably)
			if ((e.code === 'Space' || e.key === ' ')) {
			e.preventDefault();
			const v = videoRef?.current;
			if (v) {
				if (v.paused) v.play();
				else v.pause();
			}
			return;
			}

			if (e.key === 'Delete' && selectedPointIndex !== null && !isTypingTarget) {
			e.preventDefault();
			handleDeletePoint(selectedPointIndex);
			}

			// Ctrl+Z or Cmd+Z for undo
			if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !isTypingTarget) {
			e.preventDefault();
			handleUndo();
			}
		};

		// Capture phase is the key difference
		window.addEventListener('keydown', handleKeyDown, { capture: true });
		return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
	}, [selectedPointIndex, handleDeletePoint, videoRef, handleUndo]);
	
	const selectedPoint = selectedPointIndex !== null ? points[selectedPointIndex] : null;

	return h(AppContainer, null,
		h(Header, null,
			h(Title, null, 'Route Creator'),
			h(Subtitle, null, 'Create route data for npm-map-routing by clicking on the map and syncing with video timestamps')
		),

		h(Section, null,
			h(SectionTitle, null, 'Upload Files'),
			h(FileUploadGroup, null,
				h(CompactFileUploadComponent, {
					label: 'Map Image',
					accept: 'image/*',
					onFileSelect: handleMapUpload,
					currentFileName: mapFileName
				}),
				h(CompactFileUploadComponent, {
					label: 'Video',
					accept: 'video/*',
					onFileSelect: handleVideoUpload,
					currentFileName: videoFileName
				}),
				h(SwitchContainer, null,
					h(SwitchLabel, null, 'Use Presets'),
					h(Switch, null,
						h('input', {
							type: 'checkbox',
							checked: usePresets,
							onChange: (e) => setUsePresets(e.target.checked)
						}),
						h('span')
					)
				)
			)
		),

		h(MainLayout, null,
			h(LeftColumn, null,
				h(Section, null,
					h(SectionTitle, null, 'Map'),
					h(MapEditor, {
						imageSrc: mapImageSrc,
						points,
						selectedPointIndex,
						activeSpot,
						routeRef,
						setActiveSpot,
						onAddPoint: handleAddPoint,
						onUpdatePoint: handleUpdatePoint
					}),
					h(KeyboardHint, null, 'Click to add points | Shift+Click to insert after selected point | Ctrl+Click to move selected point | Ctrl+Z to undo')
				),

				h(Section, null,
					h(PointList, {
						points,
						selectedPointIndex,
						onSelectPoint: setSelectedPointIndex
					})
				)
			),

			h(RightColumn, null,
				h(Section, null,
					h(SectionTitle, null, 'Video'),
					h('div', { style: { padding: '8px', backgroundColor: '#f0f0f0', marginBottom: '8px', borderRadius: '4px' } },
						`Video Time: ${time.toFixed(2)}s | Active Spot: ${currentMarked}`
					),
					h(VideoControls, {
						videoSrc,
						videoRef
					}),
					h(KeyboardHint, null, 'Press SPACE to pause/unpause')
				),

				h(Section, null,
					h(SectionTitle, null, 'Point Editor'),
					h(PointEditor, {
						point: selectedPoint,
						pointIndex: selectedPointIndex,
						totalPoints: points.length,
						currentVideoTime: time,
						onUpdatePoint: handleUpdatePoint,
						onDeletePoint: handleDeletePoint,
						onNavigate: setSelectedPointIndex
					}),
					h(KeyboardHint, null, 'Press Delete key to remove selected point')
				),

				h(Section, null,
					h(SectionTitle, null, 'Import / Export'),
					h(ButtonGroup, null,
						h(ImportButton, { onImport: handleImportJSON }),
						h(ExportButton, { points })
					)
				)
			)
		)
	);
}

// Mount the app
const root = document.getElementById('root');
if (root) {
	createRoot(root).render(h(RouteCreator));
}
