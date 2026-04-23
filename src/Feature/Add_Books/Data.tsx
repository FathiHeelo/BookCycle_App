import { Colors, Radius, Spacing } from '@/constants/theme';
import { useI18n } from '@/hooks/use-i18n';
import { FACULTIES, BOOK_CONDITIONS } from '@/src/constants/faculties';
import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState } from 'react';
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
} from 'react-native';
import * as z from 'zod';

const VIBRANT_GOLD = '#B58D3D';

const bookDataSchema = z.object({
    title: z.string().min(2, 'Title is too short'),
    courseName: z.string().min(2, 'Course name is required'),
    facultyId: z.string().min(1, 'Please select a faculty'),
    major: z.string().min(1, 'Please select a major'),
    conditionId: z.string().min(1, 'Please select a condition'),
});

type BookData = z.infer<typeof bookDataSchema>;

interface DataScreenProps {
    onNext: (data: BookData) => void;
    onBack: () => void;
    initialData?: Partial<BookData>;
}

export default function BookDataScreen({ onNext, onBack, initialData }: DataScreenProps) {
    const { t } = useI18n();
    const [facultyModalVisible, setFacultyModalVisible] = useState(false);
    const [majorModalVisible, setMajorModalVisible] = useState(false);
    const [conditionModalVisible, setConditionModalVisible] = useState(false);

    const {
        control,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<BookData>({
        resolver: zodResolver(bookDataSchema),
        defaultValues: {
            title: '',
            courseName: initialData?.courseName || '',
            facultyId: initialData?.facultyId || '',
            major: initialData?.major || '',
            conditionId: initialData?.conditionId || '',
        },
    });

    const selectedFacultyId = watch('facultyId');
    const majorOptions = selectedFacultyId ? t(`majors.${selectedFacultyId}`, { returnObjects: true }) as string[] : [];

    const onSubmit = (data: BookData) => {
        console.log('Book Data:', data);
        onNext(data);
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Step Header */}
                <Text style={styles.stepLabel}>STEP 2 OF 4</Text>

                <View style={styles.progressContainer}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <TouchableOpacity onPress={onBack} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color={Colors.light.primary} />
                        </TouchableOpacity>
                        <Text style={styles.title}>Book Info</Text>
                    </View>
                    <Text style={styles.progressText}>50% Complete</Text>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressBarBackground}>
                    <View style={styles.progressBarFill} />
                </View>

                <View style={styles.form}>
                    {/* Book Title */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Book Title</Text>
                        <Controller
                            control={control}
                            name="title"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    style={[styles.input, errors.title && styles.inputError]}
                                    placeholder="e.g. Fundamentals of Organic Chemistry"
                                    placeholderTextColor="#A0AEC0"
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                />
                            )}
                        />
                        {errors.title && <Text style={styles.errorText}>{errors.title.message}</Text>}
                    </View>

                    {/* Course Name */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Course Name</Text>
                        <Controller
                            control={control}
                            name="courseName"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    style={[styles.input, errors.courseName && styles.inputError]}
                                    placeholder="e.g. CHEM101"
                                    placeholderTextColor="#A0AEC0"
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                />
                            )}
                        />
                        {errors.courseName && <Text style={styles.errorText}>{errors.courseName.message}</Text>}
                    </View>

                    {/* Faculty Selection */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Faculty</Text>
                        <Pressable
                            onPress={() => setFacultyModalVisible(true)}
                            style={[styles.selector, errors.facultyId && styles.inputError]}
                        >
                            <Text style={[styles.selectorText, !selectedFacultyId && styles.placeholder]}>
                                {selectedFacultyId ? t(`faculties.${selectedFacultyId}`) : 'Select Faculty'}
                            </Text>
                            <Ionicons name="chevron-down" size={20} color="#8E9BAE" />
                        </Pressable>
                        {errors.facultyId && <Text style={styles.errorText}>{errors.facultyId.message}</Text>}
                    </View>

                    {/* Major Selection */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Major</Text>
                        <Pressable
                            onPress={() => { if (selectedFacultyId) setMajorModalVisible(true); }}
                            style={[styles.selector, !selectedFacultyId && styles.disabled, errors.major && styles.inputError]}
                        >
                            <Text style={[styles.selectorText, !watch('major') && styles.placeholder]}>
                                {watch('major') || 'Select Major'}
                            </Text>
                            <Ionicons name="chevron-down" size={20} color="#8E9BAE" />
                        </Pressable>
                        {errors.major && <Text style={styles.errorText}>{errors.major.message}</Text>}
                    </View>

                    {/* Book Condition */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Condition</Text>
                        <Pressable
                            onPress={() => setConditionModalVisible(true)}
                            style={[styles.selector, errors.conditionId && styles.inputError]}
                        >
                            <Text style={[styles.selectorText, !watch('conditionId') && styles.placeholder]}>
                                {watch('conditionId') ? t(`conditions.${watch('conditionId')}`) : 'Select Condition'}
                            </Text>
                            <Ionicons name="chevron-down" size={20} color="#8E9BAE" />
                        </Pressable>
                        {errors.conditionId && <Text style={styles.errorText}>{errors.conditionId.message}</Text>}
                    </View>

                    <TouchableOpacity style={styles.mainButton} onPress={handleSubmit(onSubmit)}>
                        <Text style={styles.mainButtonText}>Continue</Text>
                        <Ionicons name="arrow-forward" size={20} color="#FFF" />
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Faculty Modal */}
            <Modal visible={facultyModalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Faculty</Text>
                            <Pressable onPress={() => setFacultyModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#1A1A1A" />
                            </Pressable>
                        </View>
                        <FlatList
                            data={FACULTIES}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <Pressable
                                    style={styles.modalItem}
                                    onPress={() => {
                                        setValue('facultyId', item.id);
                                        setValue('major', '');
                                        setFacultyModalVisible(false);
                                    }}
                                >
                                    <Ionicons name={item.icon as any} size={22} color={item.color} style={{ marginRight: 16 }} />
                                    <Text style={styles.modalItemText}>{t(`faculties.${item.id}`)}</Text>
                                </Pressable>
                            )}
                            ItemSeparatorComponent={() => <View style={styles.divider} />}
                            contentContainerStyle={{ paddingBottom: 20 }}
                        />
                    </View>
                </View>
            </Modal>

            {/* Major Modal */}
            <Modal visible={majorModalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Major</Text>
                            <Pressable onPress={() => setMajorModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#1A1A1A" />
                            </Pressable>
                        </View>
                        <FlatList
                            data={majorOptions}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <Pressable
                                    style={styles.modalItem}
                                    onPress={() => {
                                        setValue('major', item);
                                        setMajorModalVisible(false);
                                    }}
                                >
                                    <Text style={styles.modalItemText}>{item}</Text>
                                </Pressable>
                            )}
                            ItemSeparatorComponent={() => <View style={styles.divider} />}
                            contentContainerStyle={{ paddingBottom: 20 }}
                        />
                    </View>
                </View>
            </Modal>

            {/* Condition Modal */}
            <Modal visible={conditionModalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Condition</Text>
                            <Pressable onPress={() => setConditionModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#1A1A1A" />
                            </Pressable>
                        </View>
                        <FlatList
                            data={BOOK_CONDITIONS}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <Pressable
                                    style={styles.modalItem}
                                    onPress={() => {
                                        setValue('conditionId', item.id);
                                        setConditionModalVisible(false);
                                    }}
                                >
                                    <Text style={styles.modalItemText}>{t(`conditions.${item.id}`)}</Text>
                                </Pressable>
                            )}
                            ItemSeparatorComponent={() => <View style={styles.divider} />}
                            contentContainerStyle={{ paddingBottom: 20 }}
                        />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    content: {
        padding: Spacing.lg,
    },
    stepLabel: {
        color: VIBRANT_GOLD,
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 1,
        marginBottom: Spacing.xs,
    },
    progressContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: Spacing.sm,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: Colors.light.primary,
    },
    progressText: {
        fontSize: 14,
        color: '#64748B',
        fontWeight: '600',
    },
    backButton: {
        padding: 4,
        marginLeft: -4,
    },
    progressBarBackground: {
        height: 8,
        backgroundColor: '#E2E8F0',
        borderRadius: Radius.pill,
        marginBottom: Spacing.xl,
        overflow: 'hidden',
    },
    progressBarFill: {
        width: '50%',
        height: '100%',
        backgroundColor: Colors.light.primary,
        borderRadius: Radius.pill,
    },
    form: {
        marginTop: Spacing.md,
    },
    inputGroup: {
        marginBottom: Spacing.lg,
    },
    label: {
        fontSize: 13,
        fontWeight: '700',
        color: Colors.light.primary,
        marginBottom: Spacing.sm,
    },
    input: {
        height: 56,
        backgroundColor: '#F1F4F7',
        borderRadius: Radius.md,
        paddingHorizontal: 16,
        fontSize: 15,
        fontWeight: '500',
        color: '#1A1A1A',
    },
    selector: {
        height: 56,
        backgroundColor: '#F1F4F7',
        borderRadius: Radius.md,
        paddingHorizontal: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    selectorText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    placeholder: {
        color: '#A0AEC0',
        fontWeight: '500',
    },
    disabled: {
        opacity: 0.6,
    },
    inputError: {
        borderWidth: 1,
        borderColor: '#EF4444',
    },
    errorText: {
        color: '#EF4444',
        fontSize: 12,
        fontWeight: '600',
        marginTop: 4,
        marginLeft: 4,
    },
    mainButton: {
        marginTop: Spacing.xl,
        backgroundColor: Colors.light.primary,
        height: 56,
        borderRadius: Radius.pill,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    mainButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '800',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F3F5',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1A1A1A',
    },
    modalItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
    },
    modalItemText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F3F5',
        marginHorizontal: 20,
    },
});
