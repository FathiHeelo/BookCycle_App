export interface BookDetail {
  id: string;
  title: string;
  courseName?: string;
  facultyId?: string;
  major?: string;
  conditionId?: string;
  description?: string;
  pages?: string;
  price?: string;
  imageUrl?: string;
  image?: string;
  donorName?: string;
  donorUid?: string;
  author?: string;
  edition?: string;
  [key: string]: any;
}
