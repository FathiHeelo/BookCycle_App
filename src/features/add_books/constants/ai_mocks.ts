// Mock images per resource category (matching RESOURCE_CATEGORIES IDs)
export const AI_MOCK_IMAGES: Record<string, string> = {
  books:    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=1000',
  notes:    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1000',
  hardware: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1000',
  others:   'https://images.unsplash.com/photo-1434031211128-095490e7e7bb?auto=format&fit=crop&q=80&w=1000',
};

// Mock descriptions per resource category
export const AI_MOCK_DESCRIPTIONS: Record<string, { en: string; ar: string }> = {
  books: {
    en: 'A comprehensive academic textbook covering the core concepts of the subject. Well-structured chapters with examples, exercises, and summaries to support student learning.',
    ar: 'كتاب أكاديمي شامل يغطي المفاهيم الأساسية للمادة. فصول منظمة بشكل جيد تتضمن أمثلة وتمارين وخلاصات لدعم تعلم الطلاب.',
  },
  notes: {
    en: 'Organized lecture slides covering key topics and visual explanations. Ideal for quick revision and exam preparation.',
    ar: 'شرائح محاضرات منظمة تغطي المواضيع الرئيسية مع شروحات بصرية. مثالية للمراجعة السريعة والتحضير للامتحانات.',
  },
  hardware: {
    en: 'Academic lab equipment or electronic components in good condition. Suitable for practical courses and project work.',
    ar: 'معدات مختبرية أو مكونات إلكترونية بحالة جيدة. مناسبة للمواد العملية والمشاريع.',
  },
  others: {
    en: 'Academic resource shared for educational purposes. May include supplementary materials, references, or course-related content.',
    ar: 'مصدر أكاديمي مشارك لأغراض تعليمية. قد يشمل مواد تكميلية أو مراجع أو محتوى ذو صلة بالمساق.',
  },
};

export const AI_MOTIVATIONAL_MESSAGES = [
  'Your resource may help another student succeed.',
  'Sharing knowledge creates real impact.',
  'Thank you for supporting your campus community.',
  'Preparing something meaningful for other students.',
  'Small contributions can make a big difference.',
];

export const AI_MOTIVATIONAL_MESSAGES_AR = [
  'قد يساعد مصدرك طالباً آخر على النجاح.',
  'مشاركة المعرفة تخلق تأثيراً حقيقياً.',
  'شكراً لدعمك لمجتمعك الجامعي.',
  'نجهز شيئاً مفيداً للطلاب الآخرين.',
  'المساهمات الصغيرة يمكن أن تحدث فرقاً كبيراً.',
];
