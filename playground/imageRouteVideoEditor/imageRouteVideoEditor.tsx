import styled from 'styled-components';
import { type ComponentType, Fragment, useCallback, useState } from 'react';
import { pick } from 'remeda';
import VideoPlayer from './videoPlayer';
import ImageRoute from '../../package/src/components/imageRoute';
import TimePointControls from './timePointControls';
import type { ImageRouteProps, Point, RenderExtraProps, Spot } from '../../package/src/types';
import useRouteVideoSync from '../../package/src/components/VideoSync/useRouteVideoSync';

const Container = styled.div`
	position: relative;
`;

const LeftPanel = styled.div`
	position: absolute;
	width: 50%;
	height: 100%;
	overflow: auto;
`;

const ControlsStack = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;
	padding: 8px;
`;

const RightPanel = styled.div`
	position: absolute;
	width: 50%;
	right: 0;
`;

const ButtonStack = styled.div`
	display: flex;
	flex-direction: row;
	gap: 8px;
	position: absolute;
	top: 10px;
	left: 10px;
`;

const Typography = styled.p`
	margin: 0;
	font-size: 1rem;
	line-height: 1.5;
	color: rgba(0, 0, 0, 0.87);
`;

const GridContainer = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 16px;
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

const VideoPlayerContainer = styled.div`
	position: absolute;
	bottom: 0;
	width: 50%;
`;


export default function ImageRouteVideoEditor({
	alt,
	imageSrc,
	videoSrc,
	points: initialPoints,
	savePoints,
	RenderText,
	RenderPoint,
	RenderExtra,
	...props
}: {
	alt: string;
	imageSrc: string;
	videoSrc: string;
	savePoints: (points: Point[]) => void;
	RenderText?: ComponentType<{ points: Point[]; time: number }>;
} & ImageRouteProps) {
	const [points, setPoints] = useState<Point[]>(initialPoints);

	const { routeRef, videoRef, time, activeSpot, setActiveSpot } = useRouteVideoSync(points);

	const [selectedSpot, setSelectedSpot] = useState<Spot>(() => ({
		point: points[0],
		pointIndex: 0,
		percentage: 0,
	}));

	const updatePointField = (index: number, field: string, value: number) => {
		setPoints((prevPoints) => {
			const newPoints = [...prevPoints];
			if (index >= 0 && index < newPoints.length) {
				const updatedPoint = { ...newPoints[index] };
				if (value === undefined) {
					delete updatedPoint[field];
				} else {
					updatedPoint[field] = value;
				}
				newPoints[index] = updatedPoint;
			}
			return newPoints;
		});
	};

	const currentPointIndex = selectedSpot?.pointIndex ?? 0;
	const nextPointIndex = currentPointIndex !== null ? currentPointIndex + 1 : null;

	const RenderExtraSelected = useCallback(
		(props: RenderExtraProps) => (
			<Fragment>
				{RenderExtra && <RenderExtra {...props} />}
				{selectedSpot && (
					<RenderPoint
						point={selectedSpot.point}
						containerSize={props.containerSize}
						scale={props.scale}
						type='selected'
					/>
				)}
			</Fragment>
		),
		[RenderPoint, RenderExtra, selectedSpot],
	);

	return (
		<Container>
			<LeftPanel>
				<ControlsStack>
					{RenderText && <RenderText points={points} time={time} />}
					<Typography>Current Time: {time.toFixed(2)}s</Typography>
					<GridContainer>
						<TimePointControls
							name='Current'
							time={time}
							point={
								currentPointIndex !== null && currentPointIndex >= 0
									? points?.[currentPointIndex]
									: null
							}
							pointIndex={currentPointIndex}
							updatePointField={updatePointField}
						/>
						<TimePointControls
							name='Next'
							time={time}
							point={
								nextPointIndex !== null && nextPointIndex < points?.length
									? points?.[nextPointIndex]
									: null
							}
							pointIndex={nextPointIndex}
							updatePointField={updatePointField}
						/>
					</GridContainer>
				</ControlsStack>
			</LeftPanel>
			<RightPanel>
				<ImageRoute
					ref={routeRef}
					points={points}
					activeSpot={activeSpot}
					setActiveSpot={setActiveSpot}
					RenderPoint={RenderPoint}
					RenderExtra={RenderExtraSelected}
					{...props}>
					<img alt={alt} src={imageSrc} style={{ position: 'absolute', width: '100%', height: '100%', zIndex: -1, objectFit: 'contain' }} />
				</ImageRoute>
				<ButtonStack>
					<IconButton onClick={() => savePoints(points)}>
						💾
					</IconButton>
					<Button
						$disabled={currentPointIndex <= 0}
						onClick={() => {
							setSelectedSpot({
								point: points[currentPointIndex - 1],
								pointIndex: currentPointIndex - 1,
								percentage: 0,
							});
						}}>
						Prev Point
					</Button>
					<Button
						$disabled={nextPointIndex >= points?.length}
						onClick={() => {
							setSelectedSpot({
								point: points[currentPointIndex + 1],
								pointIndex: currentPointIndex + 1,
								percentage: 0,
							});
						}}>
						Next Point
					</Button>
					<Button
						onClick={() => {
							setPoints((points) => {
								const newPoints = [...points];
								newPoints.splice(nextPointIndex, 0, pick(selectedSpot.point, ['x', 'y']));
								return newPoints;
							});
						}}>
						Duplicate
					</Button>
				</ButtonStack>
			</RightPanel>
			<VideoPlayerContainer>
				<VideoPlayer
					ref={videoRef}
					src={videoSrc}
					seekFrames={1}
				/>
			</VideoPlayerContainer>
		</Container>
	);
}
