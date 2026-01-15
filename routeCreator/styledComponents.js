import styled from 'styled-components';

export const AppContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  padding: 24px;
  background-color: #fafafa;
`;

export const Header = styled.header`
  margin-bottom: 24px;
`;

export const Title = styled.h1`
  margin: 0 0 8px 0;
  font-size: 2rem;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.87);
`;

export const Subtitle = styled.p`
  margin: 0;
  font-size: 1rem;
  color: rgba(0, 0, 0, 0.6);
`;

export const MainLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

export const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const Section = styled.section`
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

export const SectionTitle = styled.h2`
  margin: 0 0 16px 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
`;

export const Button = styled.button`
  padding: 12px 24px;
  font-size: 0.875rem;
  font-weight: 600;
  background-color: ${props => props.disabled ? '#ccc' : '#2e7d32'};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.5 : 1};
  transition: background-color 0.2s;
  width: 100%;

  &:hover {
    background-color: ${props => props.disabled ? '#ccc' : '#1b5e20'};
  }
`;

export const MapContainer = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  background-color: #f5f5f5;
  border: 2px dashed #ccc;
  border-radius: 4px;
  overflow: hidden;
  cursor: ${props => props.$hasImage ? 'crosshair' : 'default'};

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

export const FileInput = styled.input`
  display: none;
`;

export const FileLabel = styled.label`
  display: block;
  padding: 12px 24px;
  background-color: #1976d2;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  text-align: center;
  transition: background-color 0.2s;

  &:hover {
    background-color: #1565c0;
  }
`;

export const FileName = styled.div`
  margin-top: 8px;
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.6);
  font-style: italic;
`;

export const VideoElement = styled.video`
  width: 100%;
  border-radius: 4px;
  background-color: #000;
`;

export const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.875rem;

  &:focus {
    outline: none;
    border-color: #1976d2;
  }
`;

export const Select = styled.select`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.875rem;
  background-color: white;

  &:focus {
    outline: none;
    border-color: #1976d2;
  }
`;

export const Label = styled.label`
  display: block;
  margin-bottom: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.87);
`;

export const FormGroup = styled.div`
  margin-bottom: 16px;
`;

export const ButtonGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 16px;
`;

export const SmallButton = styled.button`
  padding: 8px 16px;
  font-size: 0.75rem;
  font-weight: 600;
  background-color: ${props => props.$variant === 'danger' ? '#d32f2f' : '#1976d2'};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.5 : 1};
  transition: background-color 0.2s;

  &:hover {
    background-color: ${props => {
		if (props.disabled) return props.$variant === 'danger' ? '#d32f2f' : '#1976d2';
		return props.$variant === 'danger' ? '#c62828' : '#1565c0';
	}};
  }
`;

export const PointListContainer = styled.div`
  max-height: 300px;
  overflow-y: auto;
`;

export const PointItem = styled.div`
  padding: 8px 12px;
  margin-bottom: 4px;
  background-color: ${props => props.$selected ? '#e3f2fd' : '#f5f5f5'};
  border-left: 3px solid ${props => props.$selected ? '#1976d2' : 'transparent'};
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${props => props.$selected ? '#e3f2fd' : '#eeeeee'};
  }
`;

export const KeyboardHint = styled.div`
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.6);
  font-style: italic;
  margin-top: 8px;
`;

export const FileUploadGroup = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }

  > div {
    flex: 1;
  }
`;

export const CompactFileUpload = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;

  label {
    font-size: 0.9rem;
    font-weight: 500;
    white-space: nowrap;
    min-width: 80px;
  }
`;

export const SwitchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
  padding-left: 16px;
  border-left: 1px solid #e0e0e0;

  @media (max-width: 768px) {
    margin-left: 0;
    padding-left: 0;
    border-left: none;
    padding-top: 12px;
    border-top: 1px solid #e0e0e0;
  }
`;

export const Switch = styled.label`
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  span {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: 0.3s;
    border-radius: 24px;

    &:before {
      position: absolute;
      content: "";
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: 0.3s;
      border-radius: 50%;
    }
  }

  input:checked + span {
    background-color: #1976d2;
  }

  input:checked + span:before {
    transform: translateX(20px);
  }
`;

export const SwitchLabel = styled.span`
  font-size: 0.9rem;
  font-weight: 500;
  white-space: nowrap;
`;
