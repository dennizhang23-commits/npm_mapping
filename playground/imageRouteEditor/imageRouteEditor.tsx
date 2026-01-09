'use client';
import styled from 'styled-components';
import { useState } from 'react';
import { pick } from 'remeda';
import { useKey } from 'rooks';
import useHistory from '../../package/src/hooks/useHistory';
import ImageRoute from '../../package/src/components/imageRoute';
import { type ImageRouteProps, type Point, type Spot } from '../../package/src/types';

const EditorContainer = styled.div`
	position: relative;
`;

const ControlsStack = styled.div`
	display: flex;
	flex-direction: row;
	gap: 8px;
	position: absolute;
	top: 10px;
	left: 10px;
`;

const Button = styled.button<{ $disabled?: boolean }>`
	padding: 4px 8px;
	font-size: 0.875rem;
	min-width: auto;
	background-color: #1976d2;
	color: white;
	border: none;
	border-radius: 4px;
	cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
	opacity: ${props => props.$disabled ? 0.5 : 1};
	transition: background-color 0.2s;

	&:hover {
		background-color: ${props => props.$disabled ? '#1976d2' : '#1565c0'};
	}
`;

const IconButton = styled(Button)`
	min-width: unset;
	padding: 6px;
	display: flex;
	align-items: center;
	justify-content: center;
`;

const ToggleButtonGroup = styled.div`
	display: flex;
	background-color: white;
	border-radius: 4px;
	overflow: hidden;
`;

const ToggleButton = styled.button<{ $active?: boolean }>`
	padding: 4px 12px;
	font-size: 0.875rem;
	border: 1px solid rgba(0, 0, 0, 0.12);
	background-color: ${props => props.$active ? '#1976d2' : 'white'};
	color: ${props => props.$active ? 'white' : 'rgba(0, 0, 0, 0.87)'};
	cursor: pointer;
	transition: background-color 0.2s, color 0.2s;
	border-left: none;

	&:first-child {
		border-left: 1px solid rgba(0, 0, 0, 0.12);
	}

	&:hover {
		background-color: ${props => props.$active ? '#1565c0' : 'rgba(0, 0, 0, 0.04)'};
	}
`;

export default function ImageRouteEditor({
	imageSrc,
	alt,
	points: initialPoints,
	savePoints,
	...props
}: {
	imageSrc: string;
	alt: string;
	savePoints: (points: Point[]) => void;
} & ImageRouteProps) {
	const [points, setPoints] = useState<Point[]>(initialPoints);
	const [editMode, setEditMode] = useState<string>('add');
	const [activeSpot, setActiveSpot] = useState<Spot>(null);

	useHistory(points, setPoints);

	useKey(['Delete'], (e) => {
		if (!activeSpot) return;
		e.preventDefault();
		setPoints((points) => {
			const newPoints = [...points];
			newPoints.splice(activeSpot.pointIndex + (activeSpot.percentage ? 1 : 0), 1);
			return newPoints;
		});
		setActiveSpot(null);
	});

	return (
		<EditorContainer>
			<ImageRoute
				points={points}
				addPoint={
					editMode === 'add' || activeSpot?.pointIndex !== undefined
						? (point) => {
								point.marked = 1;
								setPoints((points) => {
									switch (editMode) {
										case 'add':
											return [...points, point];
										case 'relocate':
											const newPoints = [...points];
											newPoints[activeSpot.pointIndex] = {
												...newPoints[activeSpot.pointIndex],
												...pick(point, ['x', 'y']),
											};
											setActiveSpot(null);
											return newPoints;
										case 'insert':
											setActiveSpot(null);
											return points.toSpliced(activeSpot.pointIndex, 0, point);
									}
								});
							}
						: undefined
				}
				activeSpot={activeSpot}
				setActiveSpot={(activeSpot) => {
					const pointIndex = Math.min(activeSpot.pointIndex + 1, points.length - 1);
					setActiveSpot({ point: points[pointIndex], pointIndex, percentage: 0 });
				}}
				{...props}>
				<img alt={alt} src={imageSrc} style={{ position: 'absolute', width: '100%', height: '100%', zIndex: -1, objectFit: 'contain' }} />
			</ImageRoute>
			<ControlsStack>
				<IconButton onClick={() => savePoints(points)}>
					💾
				</IconButton>
				<Button
					$disabled={!points?.length}
					onClick={() => setPoints([])}>
					Clear
				</Button>
				<ToggleButtonGroup>
					<ToggleButton $active={editMode === 'add'} onClick={() => setEditMode('add')}>
						Add
					</ToggleButton>
					<ToggleButton $active={editMode === 'relocate'} onClick={() => setEditMode('relocate')}>
						Relocate
					</ToggleButton>
					<ToggleButton $active={editMode === 'insert'} onClick={() => setEditMode('insert')}>
						Insert
					</ToggleButton>
				</ToggleButtonGroup>
				<Button
					$disabled={!activeSpot}
					onClick={() => setActiveSpot(null)}>
					Clear Active
				</Button>
		</ControlsStack>
	</EditorContainer>
	);
}
