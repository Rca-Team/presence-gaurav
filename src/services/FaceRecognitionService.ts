// Re-export storage functions (using correct names)
export {
  uploadImage as uploadFaceImage
} from './face-recognition/StorageService';

// Re-export registration functions  
export {
  registerFace,
  storeUnrecognizedFace
} from './face-recognition/RegistrationService';

// Re-export attendance settings
export {
  getCutoffTime,
  updateCutoffTime,
  getAttendanceCutoffTime,
  updateAttendanceCutoffTime,
  formatCutoffTime,
  isPastCutoffTime
} from './attendance/AttendanceSettingsService';
