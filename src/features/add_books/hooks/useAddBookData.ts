import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useI18n } from '@/hooks/use-i18n';
import { FACULTIES } from '@/src/constants/faculties';
import { AddBookFormData } from '../types';
import { VIBRANT_GOLD } from '../constants';

export const useAddBookData = (initialData?: Partial<AddBookFormData>, onNext?: (data: AddBookFormData) => void) => {
    const { t, isRTL } = useI18n();

    const [facultyModalVisible, setFacultyModalVisible] = useState(false);
    const [majorModalVisible, setMajorModalVisible] = useState(false);
    const [conditionModalVisible, setConditionModalVisible] = useState(false);
    const [categoryModalVisible, setCategoryModalVisible] = useState(false);

    const bookDataSchema = z.object({
        title: z.string().min(2, t('auth.errors.fullNameMinLength')),
        courseName: z.string().min(2, 'Course name is required'),
        categoryId: z.string().min(1, 'Please select a category'),
        facultyIds: z.array(z.string()).min(1, t('auth.errors.selectFaculty')),
        majors: z.array(z.string()).min(1, t('auth.errors.selectMajor')),
        conditionId: z.string().min(1, 'Please select a condition'),
        description: z.string().min(5, 'Description is too short'),
    });

    const {
        control,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<AddBookFormData>({
        resolver: zodResolver(bookDataSchema),
        defaultValues: {
            title: initialData?.title || '',
            courseName: initialData?.courseName || '',
            categoryId: initialData?.categoryId || '',
            facultyIds: initialData?.facultyIds || [],
            majors: initialData?.majors || [],
            conditionId: initialData?.conditionId || '',
            description: initialData?.description || '',
        },
    });

    const selectedFacultyIds: string[] = watch('facultyIds') || [];
    const selectedMajors: string[] = watch('majors') || [];

    const availableMajorsList = useMemo(() => {
        const list: string[] = [];
        if (selectedFacultyIds.includes('all')) {
            FACULTIES.forEach(f => {
                const majors = t(`majors.${f.id}`, { returnObjects: true }) as string[];
                if (Array.isArray(majors)) {
                    majors.forEach(m => { if (!list.includes(m)) list.push(m); });
                }
            });
        } else {
            selectedFacultyIds.forEach((fId: string) => {
                const majors = t(`majors.${fId}`, { returnObjects: true }) as string[];
                if (Array.isArray(majors)) {
                    majors.forEach((m: string) => {
                        if (!list.includes(m)) list.push(m);
                    });
                }
            });
        }
        return ['all', ...list];
    }, [selectedFacultyIds, t]);

    const toggleFaculty = (id: string) => {
        let current = [...selectedFacultyIds];
        if (id === 'all') {
            if (current.includes('all')) {
                current = [];
                setValue('majors', []);
            } else {
                current = ['all'];
                setValue('majors', ['all']);
            }
        } else {
            current = current.filter(f => f !== 'all');
            const index = current.indexOf(id);
            if (index > -1) {
                current.splice(index, 1);
            } else {
                current.push(id);
            }
            setValue('majors', []);
        }
        setValue('facultyIds', current);
    };

    const toggleMajor = (major: string) => {
        let current = [...selectedMajors];
        if (major === 'all') {
            current = current.includes('all') ? [] : ['all'];
        } else {
            current = current.filter(m => m !== 'all');
            const index = current.indexOf(major);
            if (index > -1) {
                current.splice(index, 1);
            } else {
                current.push(major);
            }
        }
        setValue('majors', current);
    };

    const onSubmit = (data: AddBookFormData) => {
        if (onNext) onNext(data);
    };

    const facultyList = useMemo(() => [
        { id: 'all', icon: 'globe-outline', color: VIBRANT_GOLD },
        ...FACULTIES
    ], []);

    return {
        control,
        handleSubmit,
        errors,
        watch,
        setValue,
        onSubmit,
        facultyModalVisible, setFacultyModalVisible,
        majorModalVisible, setMajorModalVisible,
        conditionModalVisible, setConditionModalVisible,
        categoryModalVisible, setCategoryModalVisible,
        selectedFacultyIds,
        selectedMajors,
        availableMajorsList,
        facultyList,
        toggleFaculty,
        toggleMajor,
        t,
        isRTL
    };
};
