import { figma } from './utils/index.js';

const data = $state({
  ppi: 300,
  unit: 'mm',
  selectedPreset: 'A4',
  sheetWidth: 297,
  sheetHeight: 210,
  padding: 5,
  createComponent: true,
  shapeType: 'RECTANGLE',
  shapeWidth: 65,
  shapeHeight: 45,
  gap: 5,
  alignX: 'C',
  alignY: 'C',
  genGuides: true,
  shapeColor: '#7B61FF'
});

const settings = figma.getDocumentStorage('compositor-settings', data);

export default settings;
