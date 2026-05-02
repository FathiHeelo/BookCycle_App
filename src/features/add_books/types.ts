export interface AddBookFormData {
  title: string;
  courseName: string;
  categoryId: string;
  facultyIds: string[];
  majors: string[];
  conditionId: string;
  description: string;
}

export interface DataScreenProps {
  onNext: (data: AddBookFormData) => void;
  onBack: () => void;
  initialData?: Partial<AddBookFormData>;
  analysisResult?: any;
}

export interface UploadPhotoProps {
  onNext: (imageUri: string, analysis?: any) => void;
  initialImage?: string;
}
