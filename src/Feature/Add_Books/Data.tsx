import { Colors, Radius, Spacing } from '@/constants/theme';
import { useI18n } from '@/hooks/use-i18n';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { FACULTIES, BOOK_CONDITIONS } from '@/src/constants/faculties';
import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState, useMemo, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
    FlatList,
    Modal,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    TouchableWithoutFeedback,
} from 'react-native';
import * as z from 'zod';

const VIBRANT_GOLD = '#B58D3D';

const RESOURCE_CATEGORIES = [
    { id: 'books', icon: 'book' },
    { id: 'notes', icon: 'document-text' },
    { id: 'hardware', icon: 'construct' },
    { id: 'others', icon: 'ellipsis-horizontal-circle' },
];

interface DataScreenProps {
    onNext: (data: any) => void;
    onBack: () => void;
    initialData?: any;
}

export default function BookDataScreen({ onNext, onBack, initialData }: DataScreenProps) {
    const { t, isRTL } = useI18n();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    
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
    } = useForm({
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

    // Logic for available majors: collect from all selected faculties
    const availableMajorsList = useMemo(() => {
        const list: string[] = [];
        if (selectedFacultyIds.includes('all')) {
            // Include all majors from all faculties if "All" is selected
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

    const textAlign = isRTL ? 'right' : 'left';
    const flexDirection = isRTL ? 'row-reverse' : 'row';

    const toggleFaculty = (id: string) => {
        let current = [...selectedFacultyIds];
        if (id === 'all') {
            if (current.includes('all')) {
                current = [];
                setValue('majors', []);
            } else {
                current = ['all'];
                setValue('majors', ['all']); // Auto-select all majors if all faculties selected
            }
        } else {
            current = current.filter(f => f !== 'all');
            const index = current.indexOf(id);
            if (index > -1) {
                current.splice(index, 1);
            } else {
                current.push(id);
            }
            // Clear majors when specific faculties are toggled to ensure consistency
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

    const onSubmit = (data: any) => {
        onNext(data);
    };

    const facultyList = useMemo(() => [
        { id: 'all', icon: 'globe-outline', color: VIBRANT_GOLD },
        ...FACULTIES
    ], []);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <Text style={[styles.stepLabel, { textAlign }]}>{isRTL ? 'الخطوة 2 من 4' : 'STEP 2 OF 4'}</Text>

                <View style={[styles.progressContainer, { flexDirection }]}>
                    <View style={{ flexDirection, alignItems: 'center', gap: 12 }}>
                        <TouchableOpacity onPress={onBack} style={styles.backButton}>
                            <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={24} color={Colors.light.primary} />
                        </TouchableOpacity>
                        <Text style={styles.title}>{isRTL ? 'معلومات المصدر' : 'Material Info'}</Text>
                    </View>
                    <Text style={styles.progressText}>{isRTL ? '50% مكتمل' : '50% Complete'}</Text>
                </View>

                <View style={styles.progressBarBackground}>
                    <View style={[styles.progressBarFill, isRTL && { alignSelf: 'flex-end' }]} />
                </View>

                <View style={styles.form}>
                    {/* Category */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { textAlign }]}>{t('categories.title')}</Text>
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => setCategoryModalVisible(true)}
                            style={[styles.selector, { flexDirection }, errors.categoryId && styles.inputError]}
                        >
                            <Text style={[styles.selectorText, !watch('categoryId') && styles.placeholder]} numberOfLines={1}>
                                {watch('categoryId') ? t(`categories.${watch('categoryId')}`) : t('categories.placeholder')}
                            </Text>
                            <Ionicons name="chevron-down" size={20} color="#8E9BAE" />
                        </TouchableOpacity>
                    </View>

                    {/* Title */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { textAlign }]}>{isRTL ? 'العنوان' : 'Title'}</Text>
                        <Controller
                            control={control}
                            name="title"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    style={[styles.input, { textAlign }, errors.title && styles.inputError]}
                                    placeholder={isRTL ? 'مثلاً: آردوينو أونو أو تلخيص مادة' : 'e.g. Arduino Uno or Summary'}
                                    placeholderTextColor="#A0AEC0"
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                />
                            )}
                        />
                    </View>

                    {/* Course */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { textAlign }]}>{isRTL ? 'اسم المساق المرتبط' : 'Related Course'}</Text>
                        <Controller
                            control={control}
                            name="courseName"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    style={[styles.input, { textAlign }, errors.courseName && styles.inputError]}
                                    placeholder="e.g. ENG101"
                                    placeholderTextColor="#A0AEC0"
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                />
                            )}
                        />
                    </View>

                    {/* Faculty (Multiple) */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { textAlign }]}>
                            {isRTL ? 'اختر الكليات التي لها علاقة بالمصدر' : 'Select faculties related to the resource'}
                        </Text>
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => setFacultyModalVisible(true)}
                            style={[styles.selector, { flexDirection }, errors.facultyIds && styles.inputError]}
                        >
                            <Text style={[styles.selectorText, selectedFacultyIds.length === 0 && styles.placeholder]} numberOfLines={1}>
                                {selectedFacultyIds.length > 0 
                                  ? selectedFacultyIds.map(fId => fId === 'all' ? (isRTL ? 'الجميع' : 'All') : t(`faculties.${fId}`)).join(', ')
                                  : (isRTL ? 'اختر كليات المصدر' : 'Select resource faculties')}
                            </Text>
                            <Ionicons name="chevron-down" size={20} color="#8E9BAE" />
                        </TouchableOpacity>
                    </View>

                    {/* Major (Multiple) */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { textAlign }]}>{isRTL ? 'التخصصات' : 'Majors'}</Text>
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => setMajorModalVisible(true)}
                            disabled={selectedFacultyIds.length === 0}
                            style={[styles.selector, { flexDirection }, selectedFacultyIds.length === 0 && styles.disabled, errors.majors && styles.inputError]}
                        >
                            <Text style={[styles.selectorText, selectedMajors.length === 0 && styles.placeholder]} numberOfLines={1}>
                                {selectedMajors.length > 0 
                                  ? selectedMajors.map(m => m === 'all' ? (isRTL ? 'جميع التخصصات' : 'All Majors') : m).join(', ')
                                  : (isRTL ? 'اختر تخصصات المصدر' : 'Select resource majors')}
                            </Text>
                            <Ionicons name="chevron-down" size={20} color="#8E9BAE" />
                        </TouchableOpacity>
                    </View>

                    {/* Condition */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { textAlign }]}>{isRTL ? 'حالة المصدر' : 'Material Condition'}</Text>
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => setConditionModalVisible(true)}
                            style={[styles.selector, { flexDirection }, errors.conditionId && styles.inputError]}
                        >
                            <Text style={[styles.selectorText, !watch('conditionId') && styles.placeholder]} numberOfLines={1}>
                                {watch('conditionId') ? t(`conditions.${watch('conditionId')}`) : (isRTL ? 'اختر الحالة' : 'Select Condition')}
                            </Text>
                            <Ionicons name="chevron-down" size={20} color="#8E9BAE" />
                        </TouchableOpacity>
                    </View>

                    {/* Description */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { textAlign }]}>{t('bookDetails.description')}</Text>
                        <Controller
                            control={control}
                            name="description"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    style={[styles.input, styles.textArea, { textAlign }, errors.description && styles.inputError]}
                                    placeholder={isRTL ? 'أضف وصفاً تفصيلياً للمصدر...' : 'Add a detailed description...'}
                                    placeholderTextColor="#A0AEC0"
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                    multiline
                                />
                            )}
                        />
                    </View>

                    <TouchableOpacity style={[styles.mainButton, { flexDirection }]} onPress={handleSubmit(onSubmit)}>
                        <Text style={styles.mainButtonText}>{t('common.next')}</Text>
                        <Ionicons name={isRTL ? "arrow-back" : "arrow-forward"} size={20} color="#FFF" />
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Category Modal */}
            <Modal visible={categoryModalVisible} transparent animationType="slide" onRequestClose={() => setCategoryModalVisible(false)}>
                <TouchableWithoutFeedback onPress={() => setCategoryModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={styles.modalContent}>
                                <View style={[styles.modalHeader, { flexDirection }]}>
                                    <Text style={styles.modalTitle}>{t('categories.title')}</Text>
                                    <TouchableOpacity onPress={() => setCategoryModalVisible(false)}>
                                        <Ionicons name="close" size={24} color="#1A1A1A" />
                                    </TouchableOpacity>
                                </View>
                                <FlatList
                                    data={RESOURCE_CATEGORIES}
                                    keyExtractor={(item) => item.id}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            style={[styles.modalItem, { flexDirection }]}
                                            onPress={() => {
                                                setValue('categoryId', item.id);
                                                setCategoryModalVisible(false);
                                            }}
                                        >
                                            <Ionicons name={item.icon as any} size={22} color={theme.primary} style={isRTL ? { marginLeft: 16 } : { marginRight: 16 }} />
                                            <Text style={[styles.modalItemText, { textAlign }]}>{t(`categories.${item.id}`)}</Text>
                                        </TouchableOpacity>
                                    )}
                                    ItemSeparatorComponent={() => <View style={styles.divider} />}
                                    contentContainerStyle={{ paddingBottom: 20 }}
                                />
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            {/* Faculty Modal */}
            <Modal visible={facultyModalVisible} transparent animationType="slide" onRequestClose={() => setFacultyModalVisible(false)}>
                <TouchableWithoutFeedback onPress={() => setFacultyModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={styles.modalContent}>
                                <View style={[styles.modalHeader, { flexDirection }]}>
                                    <Text style={styles.modalTitle}>{isRTL ? 'اختر الكليات' : 'Select Faculties'}</Text>
                                    <TouchableOpacity onPress={() => setFacultyModalVisible(false)}>
                                        <Text style={{ color: theme.primary, fontWeight: '700' }}>{t('common.save')}</Text>
                                    </TouchableOpacity>
                                </View>
                                <FlatList
                                    data={facultyList}
                                    keyExtractor={(item) => item.id}
                                    renderItem={({ item }) => {
                                        const isSelected = selectedFacultyIds.includes(item.id);
                                        return (
                                            <TouchableOpacity
                                                style={[styles.modalItem, { flexDirection }]}
                                                onPress={() => toggleFaculty(item.id)}
                                            >
                                                <Ionicons name={item.icon as any} size={22} color={item.color} style={isRTL ? { marginLeft: 16 } : { marginRight: 16 }} />
                                                <View style={{ flex: 1 }}>
                                                    <Text style={[styles.modalItemText, { textAlign, fontWeight: isSelected ? '800' : '500' }]}>
                                                        {item.id === 'all' ? (isRTL ? 'الجميع' : 'All') : t(`faculties.${item.id}`)}
                                                    </Text>
                                                    {item.id === 'all' && (
                                                        <Text style={[styles.hintText, { textAlign }]}>{isRTL ? '(إذا كانت المادة متطلب جامعة إجباري)' : '(If university requirement)'}</Text>
                                                    )}
                                                </View>
                                                {isSelected && <Ionicons name="checkmark-circle" size={24} color="#10B981" />}
                                            </TouchableOpacity>
                                        );
                                    }}
                                    ItemSeparatorComponent={() => <View style={styles.divider} />}
                                    contentContainerStyle={{ paddingBottom: 20 }}
                                />
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            {/* Major Modal */}
            <Modal visible={majorModalVisible} transparent animationType="slide" onRequestClose={() => setMajorModalVisible(false)}>
                <TouchableWithoutFeedback onPress={() => setMajorModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={styles.modalContent}>
                                <View style={[styles.modalHeader, { flexDirection }]}>
                                    <Text style={styles.modalTitle}>{t('auth.signup.majorLabel')}</Text>
                                    <TouchableOpacity onPress={() => setMajorModalVisible(false)}>
                                        <Text style={{ color: theme.primary, fontWeight: '700' }}>{t('common.save')}</Text>
                                    </TouchableOpacity>
                                </View>
                                <FlatList
                                    data={availableMajorsList}
                                    keyExtractor={(item) => item}
                                    renderItem={({ item }) => {
                                        const isSelected = selectedMajors.includes(item);
                                        return (
                                            <TouchableOpacity
                                                style={[styles.modalItem, { flexDirection }]}
                                                onPress={() => toggleMajor(item)}
                                            >
                                                <Text style={[styles.modalItemText, { textAlign, fontWeight: isSelected ? '800' : '500' }]}>
                                                  {item === 'all' ? (isRTL ? 'الجميع' : 'All') : item}
                                                </Text>
                                                {isSelected && <Ionicons name="checkmark-circle" size={24} color="#10B981" />}
                                            </TouchableOpacity>
                                        );
                                    }}
                                    ItemSeparatorComponent={() => <View style={styles.divider} />}
                                    contentContainerStyle={{ paddingBottom: 20 }}
                                />
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            {/* Condition Modal */}
            <Modal visible={conditionModalVisible} transparent animationType="slide" onRequestClose={() => setConditionModalVisible(false)}>
                <TouchableWithoutFeedback onPress={() => setConditionModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={styles.modalContent}>
                                <View style={[styles.modalHeader, { flexDirection }]}>
                                    <Text style={styles.modalTitle}>{isRTL ? 'حالة المصدر' : 'Condition'}</Text>
                                    <TouchableOpacity onPress={() => setConditionModalVisible(false)}>
                                        <Ionicons name="close" size={24} color="#1A1A1A" />
                                    </TouchableOpacity>
                                </View>
                                <FlatList
                                    data={BOOK_CONDITIONS}
                                    keyExtractor={(item) => item.id}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            style={[styles.modalItem, { flexDirection }]}
                                            onPress={() => {
                                                setValue('conditionId', item.id);
                                                setConditionModalVisible(false);
                                            }}
                                        >
                                            <Text style={[styles.modalItemText, { textAlign }]}>{t(`conditions.${item.id}`)}</Text>
                                        </TouchableOpacity>
                                    )}
                                    ItemSeparatorComponent={() => <View style={styles.divider} />}
                                    contentContainerStyle={{ paddingBottom: 20 }}
                                />
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    content: { padding: Spacing.lg },
    stepLabel: { color: VIBRANT_GOLD, fontSize: 12, fontWeight: '800', letterSpacing: 1, marginBottom: Spacing.xs },
    progressContainer: { justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: Spacing.sm },
    title: { fontSize: 28, fontWeight: '800', color: Colors.light.primary },
    progressText: { fontSize: 14, color: '#64748B', fontWeight: '600' },
    backButton: { padding: 4, marginLeft: -4 },
    progressBarBackground: { height: 8, backgroundColor: '#E2E8F0', borderRadius: Radius.pill, marginBottom: Spacing.xl, overflow: 'hidden' },
    progressBarFill: { width: '50%', height: '100%', backgroundColor: Colors.light.primary, borderRadius: Radius.pill },
    form: { marginTop: Spacing.md },
    inputGroup: { marginBottom: Spacing.lg },
    label: { fontSize: 13, fontWeight: '700', color: Colors.light.primary, marginBottom: Spacing.sm },
    input: { height: 56, backgroundColor: '#F1F4F7', borderRadius: Radius.md, paddingHorizontal: 16, fontSize: 15, fontWeight: '500', color: '#1A1A1A' },
    textArea: { height: 120, paddingTop: 16, textAlignVertical: 'top' },
    selector: { height: 56, backgroundColor: '#F1F4F7', borderRadius: Radius.md, paddingHorizontal: 16, justifyContent: 'space-between', alignItems: 'center' },
    selectorText: { fontSize: 15, fontWeight: '600', color: '#1A1A1A', flex: 1 },
    placeholder: { color: '#A0AEC0', fontWeight: '500' },
    disabled: { opacity: 0.6 },
    inputError: { borderWidth: 1, borderColor: '#EF4444' },
    errorText: { color: '#EF4444', fontSize: 12, fontWeight: '600', marginTop: 4, marginLeft: 4 },
    mainButton: { marginTop: Spacing.xl, backgroundColor: Colors.light.primary, height: 56, borderRadius: Radius.pill, justifyContent: 'center', alignItems: 'center', gap: Spacing.sm },
    mainButtonText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '80%' },
    modalHeader: { justifyContent: 'space-between', alignItems: 'center', padding: 24, borderBottomWidth: 1, borderBottomColor: '#F1F3F5' },
    modalTitle: { fontSize: 18, fontWeight: '800', color: '#1A1A1A' },
    modalItem: { alignItems: 'center', padding: 20 },
    modalItemText: { fontSize: 16, fontWeight: '600', color: '#1A1A1A', flex: 1 },
    hintText: { fontSize: 12, color: '#64748B', fontWeight: '500', marginTop: 2 },
    divider: { height: 1, backgroundColor: '#F1F3F5', marginHorizontal: 20 },
});
