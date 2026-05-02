import React from 'react';
import {
    FlatList,
    Modal,
    SafeAreaView,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    TouchableWithoutFeedback,
    Pressable,
    ActivityIndicator,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Controller, useWatch } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { DataStyles as styles } from '../styles';
import { RESOURCE_CATEGORIES, BOOK_CONDITIONS, VIBRANT_GOLD } from '../constants';
import { useAddBookData } from '../hooks/useAddBookData';
import { useAppTheme } from '@/context/ThemeContext';

type DataScreenUIProps = ReturnType<typeof useAddBookData> & {
    onBack: (values: any) => void;
};

export const DataScreenUI = (props: DataScreenUIProps) => {
    const { 
        control, handleSubmit, errors, watch, setValue, onSubmit, 
        handleGenerateDescription, aiLoading, remainingRequests,
        facultyModalVisible, setFacultyModalVisible, majorModalVisible, setMajorModalVisible,
        conditionModalVisible, setConditionModalVisible, categoryModalVisible, setCategoryModalVisible,
        selectedFacultyIds, selectedMajors, availableMajorsList, facultyList,
        toggleFaculty, toggleMajor, t, isRTL, onBack, getValues 
    } = props;

    const categoryId = useWatch({ control, name: 'categoryId' });
    const handleBack = () => onBack(getValues());

    const { theme: themeKey } = useAppTheme();
    const themeColors = Colors[themeKey];
    const textAlign = isRTL ? 'right' : 'left';
    const flexDirection = isRTL ? 'row-reverse' : 'row';

    const [focusedInput, setFocusedInput] = React.useState<string | null>(null);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 120 : 0}
            >
                <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 100 }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                    <View style={[local.guideBox, { backgroundColor: themeKey === 'dark' ? '#0A1A2F' : '#F0F9FF', borderColor: themeColors.primary + '30' }]}>
                        <Ionicons name="information-circle" size={20} color={themeColors.primary} />
                        <Text style={[local.guideText, { color: themeColors.text, textAlign }]}>
                            {isRTL 
                                ? 'هذه الخطوة مخصصة لإدخال بيانات المصدر بالتفصيل. تأكد من اختيار الفئة الصحيحة ووصف المصدر بدقة ليجده الطلاب بسهولة.' 
                                : 'This step is for entering detailed material info. Make sure to select the correct category and describe the resource accurately so other students can find it easily.'}
                        </Text>
                    </View>

                    <Text style={[styles.stepLabel, { textAlign, color: themeColors.primary }]}>{isRTL ? 'الخطوة 2 من 4' : 'STEP 2 OF 4'}</Text>

                    <View style={[styles.progressContainer, { flexDirection }]}>
                        <View style={{ flexDirection, alignItems: 'center', gap: 12 }}>
                            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                                <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={24} color={themeColors.primary} />
                            </TouchableOpacity>
                            <Text style={[styles.title, { color: themeColors.text }]}>{isRTL ? 'معلومات المصدر' : 'Material Info'}</Text>
                        </View>
                        <Text style={[styles.progressText, { color: themeColors.textSecondary }]}>{isRTL ? '50% مكتمل' : '50% Complete'}</Text>
                    </View>

                    <View style={[styles.progressBarBackground, { backgroundColor: themeColors.border }]}>
                        <View style={[styles.progressBarFill, { backgroundColor: themeColors.primary }, isRTL && { alignSelf: 'flex-end' }]} />
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { textAlign, color: themeColors.text }]}>{t('categories.title')}</Text>
                            <Controller
                                control={control}
                                name="categoryId"
                                render={({ field: { value, onChange } }) => (
                                    <TouchableOpacity
                                        activeOpacity={0.7}
                                        onPress={() => setCategoryModalVisible(true)}
                                        style={[styles.selector, { 
                                            flexDirection, 
                                            backgroundColor: themeKey === 'dark' ? themeColors.card : '#F8FAFC', 
                                            borderColor: errors.categoryId ? '#EF4444' : (value ? VIBRANT_GOLD : themeColors.border),
                                            borderWidth: value ? 1.5 : 1
                                        }]}
                                    >
                                        <Text style={[styles.selectorText, { color: themeColors.text }, !value && { color: themeColors.textSecondary }]} numberOfLines={1}>
                                            {value ? t(`categories.${value}`) : t('categories.placeholder')}
                                        </Text>
                                        <Ionicons name="chevron-down" size={20} color={themeColors.textSecondary} />
                                    </TouchableOpacity>
                                )}
                            />
                        </View>

                        {/* Price - Only for Hardware */}
                        {categoryId === 'hardware' && (
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { textAlign, color: themeColors.text, marginBottom: 4 }]}>{isRTL ? 'السعر (شيكل) - اختياري' : 'Price (₪) - Optional'}</Text>
                                <Text style={[local.hintText, { textAlign, color: themeColors.textSecondary, marginBottom: 8 }]}>
                                    {isRTL ? 'ملاحظة: يمكنك إضافة سعر بالـشـيـكـل أو تركها فارغة لتكون مجانية.' : 'Note: You can add a price in Shekel or leave it empty to be free.'}
                                </Text>
                                <Controller
                                    control={control}
                                    name="price"
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <View style={[
                                            styles.input, 
                                            { 
                                                flexDirection, 
                                                alignItems: 'center',
                                                paddingHorizontal: 0,
                                                backgroundColor: themeKey === 'dark' ? themeColors.card : '#F8FAFC', 
                                                borderColor: errors.price ? '#EF4444' : (focusedInput === 'price' ? VIBRANT_GOLD : themeColors.border),
                                                borderWidth: focusedInput === 'price' ? 2 : 1
                                            }
                                        ]}>
                                            <View style={{ width: 45, height: '100%', justifyContent: 'center', alignItems: 'center', borderRightWidth: isRTL ? 0 : 1, borderLeftWidth: isRTL ? 1 : 0, borderColor: themeColors.border }}>
                                                <Text style={{ fontSize: 18, color: themeColors.text, fontWeight: '700' }}>₪</Text>
                                            </View>
                                            <TextInput
                                                style={{ 
                                                    flex: 1,
                                                    height: '100%',
                                                    textAlign, 
                                                    color: themeColors.text, 
                                                    paddingHorizontal: 16,
                                                    fontSize: 16,
                                                    fontWeight: '600'
                                                }}
                                                placeholder={isRTL ? 'مثلاً: 50' : 'e.g. 50'}
                                                placeholderTextColor={themeColors.textSecondary}
                                                keyboardType="numeric"
                                                onBlur={() => { onBlur(); setFocusedInput(null); }}
                                                onFocus={() => setFocusedInput('price')}
                                                onChangeText={(val) => {
                                                    const cleaned = val.replace(/[^0-9.]/g, '');
                                                    onChange(cleaned ? parseFloat(cleaned) : undefined);
                                                }}
                                                value={value?.toString() || ''}
                                            />
                                        </View>
                                    )}
                                />
                            </View>
                        )}
                        {categoryId && categoryId !== 'hardware' && (
                            <View style={{ marginBottom: 16, padding: 12, backgroundColor: themeKey === 'dark' ? '#0A1A2F' : '#F0F9FF', borderRadius: 10 }}>
                                <Text style={{ fontSize: 11, color: themeColors.textSecondary, textAlign, lineHeight: 16 }}>
                                    {isRTL 
                                        ? 'ملاحظة: الكتب والملخصات تُعرض مجاناً دائماً. خيار البيع متاح فقط للقطع والعدة.' 
                                        : 'Note: Books and summaries are always free. The selling option is only available for hardware and equipment.'}
                                </Text>
                            </View>
                        )}

                        {/* Title */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { textAlign, color: themeColors.text }]}>{isRTL ? 'العنوان' : 'Title'}</Text>
                            <Controller
                                control={control}
                                name="title"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <TextInput
                                        style={[styles.input, { 
                                            textAlign, 
                                            color: themeColors.text, 
                                            backgroundColor: themeKey === 'dark' ? themeColors.card : '#F8FAFC', 
                                            borderColor: errors.title ? '#EF4444' : (focusedInput === 'title' ? VIBRANT_GOLD : themeColors.border),
                                            borderWidth: focusedInput === 'title' ? 2 : 1
                                        }]}
                                        placeholder={isRTL ? 'مثلاً: آردوينو أونو أو تلخيص مادة' : 'e.g. Arduino Uno or Summary'}
                                        placeholderTextColor={themeColors.textSecondary}
                                        onBlur={() => { onBlur(); setFocusedInput(null); }}
                                        onFocus={() => setFocusedInput('title')}
                                        onChangeText={onChange}
                                        value={value}
                                    />
                                )}
                            />
                        </View>

                        {/* Course */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { textAlign, color: themeColors.text }]}>{isRTL ? 'اسم المساق المرتبط' : 'Related Course'}</Text>
                            <Controller
                                control={control}
                                name="courseName"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <TextInput
                                        style={[styles.input, { 
                                            textAlign, 
                                            color: themeColors.text, 
                                            backgroundColor: themeKey === 'dark' ? themeColors.card : '#F8FAFC', 
                                            borderColor: errors.courseName ? '#EF4444' : (focusedInput === 'course' ? VIBRANT_GOLD : themeColors.border),
                                            borderWidth: focusedInput === 'course' ? 2 : 1
                                        }]}
                                        placeholder="e.g. ENG101"
                                        placeholderTextColor={themeColors.textSecondary}
                                        onBlur={() => { onBlur(); setFocusedInput(null); }}
                                        onFocus={() => setFocusedInput('course')}
                                        onChangeText={onChange}
                                        value={value}
                                    />
                                )}
                            />
                        </View>

                        {/* Faculty (Multiple) */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { textAlign, color: themeColors.text, marginBottom: 4 }]}>
                                {isRTL ? 'اختر الكليات التي لها علاقة بالمصدر' : 'Select faculties related to the resource'}
                            </Text>
                            <Text style={[local.hintText, { textAlign, color: themeColors.textSecondary, marginBottom: 8 }]}>
                                {isRTL ? 'اختر الكليات التي قد يستفيد طلابها من هذا المصدر.' : 'Pick faculties whose students might benefit from this.'}
                            </Text>
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => setFacultyModalVisible(true)}
                                style={[styles.selector, { 
                                    flexDirection, 
                                    backgroundColor: themeKey === 'dark' ? themeColors.card : '#F8FAFC', 
                                    borderColor: errors.facultyIds ? '#EF4444' : (selectedFacultyIds.length > 0 ? VIBRANT_GOLD : themeColors.border),
                                    borderWidth: selectedFacultyIds.length > 0 ? 1.5 : 1
                                }]}
                            >
                                <Text style={[styles.selectorText, { color: themeColors.text }, selectedFacultyIds.length === 0 && { color: themeColors.textSecondary }]} numberOfLines={1}>
                                    {selectedFacultyIds.length > 0 
                                    ? selectedFacultyIds.map(fId => fId === 'all' ? (isRTL ? 'إجباري جامعة' : 'University Requirements') : t(`faculties.${fId}`)).join(', ')
                                    : (isRTL ? 'اختر كليات المصدر' : 'Select resource faculties')}
                                </Text>
                                <Ionicons name="chevron-down" size={20} color={themeColors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        {/* Major (Multiple) */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { textAlign, color: themeColors.text, marginBottom: 4 }]}>{isRTL ? 'التخصصات' : 'Majors'}</Text>
                            <Text style={[local.hintText, { textAlign, color: themeColors.textSecondary, marginBottom: 8 }]}>
                                {isRTL ? 'يمكنك تحديد تخصصات معينة أو اختيار "الجميع".' : 'You can specify certain majors or pick "All".'}
                            </Text>
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => setMajorModalVisible(true)}
                                disabled={selectedFacultyIds.length === 0}
                                style={[styles.selector, { 
                                    flexDirection, 
                                    backgroundColor: themeKey === 'dark' ? themeColors.card : '#F8FAFC', 
                                    borderColor: errors.majors ? '#EF4444' : (selectedMajors.length > 0 ? VIBRANT_GOLD : themeColors.border),
                                    borderWidth: selectedMajors.length > 0 ? 1.5 : 1,
                                    opacity: selectedFacultyIds.length === 0 ? 0.5 : 1
                                }]}
                            >
                                <Text style={[styles.selectorText, { color: themeColors.text }, selectedMajors.length === 0 && { color: themeColors.textSecondary }]} numberOfLines={1}>
                                    {selectedMajors.length > 0 
                                    ? selectedMajors.map(m => m === 'all' ? (isRTL ? 'جميع التخصصات' : 'All Majors') : m).join(', ')
                                    : (isRTL ? 'اختر تخصصات المصدر' : 'Select resource majors')}
                                </Text>
                                <Ionicons name="chevron-down" size={20} color={themeColors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { textAlign, color: themeColors.text, marginBottom: 4 }]}>{isRTL ? 'حالة المصدر' : 'Material Condition'}</Text>
                            <Text style={[local.hintText, { textAlign, color: themeColors.textSecondary, marginBottom: 8 }]}>
                                {isRTL ? 'صف حالة المصدر بدقة (جديد، مستعمل، إلخ).' : 'Describe the condition accurately (New, Used, etc).'}
                            </Text>
                            <Controller
                                control={control}
                                name="conditionId"
                                render={({ field: { value, onChange } }) => (
                                    <TouchableOpacity
                                        activeOpacity={0.7}
                                        onPress={() => setConditionModalVisible(true)}
                                        style={[styles.selector, { 
                                            flexDirection, 
                                            backgroundColor: themeKey === 'dark' ? themeColors.card : '#F8FAFC', 
                                            borderColor: errors.conditionId ? '#EF4444' : (value ? VIBRANT_GOLD : themeColors.border),
                                            borderWidth: value ? 1.5 : 1
                                        }]}
                                    >
                                        <Text style={[styles.selectorText, { color: themeColors.text }, !value && { color: themeColors.textSecondary }]} numberOfLines={1}>
                                            {value ? t(`conditions.${value}`) : (isRTL ? 'اختر الحالة' : 'Select Condition')}
                                        </Text>
                                        <Ionicons name="chevron-down" size={20} color={themeColors.textSecondary} />
                                    </TouchableOpacity>
                                )}
                            />
                        </View>

                        {/* Description */}
                        <View style={styles.inputGroup}>
                            <View style={{ flexDirection, justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                <Text style={[styles.label, { textAlign, color: themeColors.text, marginBottom: 0 }]}>{t('bookDetails.description')}</Text>
                                <TouchableOpacity 
                                    onPress={handleGenerateDescription} 
                                    disabled={aiLoading}
                                    style={{ flexDirection, alignItems: 'center', gap: 4 }}
                                >
                                    {aiLoading ? (
                                        <ActivityIndicator size="small" color={themeColors.primary} />
                                    ) : (
                                        <>
                                            <Ionicons name="sparkles" size={14} color={VIBRANT_GOLD} />
                                            <Text style={{ fontSize: 12, color: VIBRANT_GOLD, fontWeight: '600' }}>
                                                {isRTL ? 'توليد بالذكاء الاصطناعي' : 'Generate with AI'}
                                            </Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                            <Controller
                                control={control}
                                name="description"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <TextInput
                                        style={[styles.input, styles.textArea, { 
                                            textAlign, 
                                            color: themeColors.text, 
                                            backgroundColor: themeKey === 'dark' ? themeColors.card : '#F8FAFC', 
                                            borderColor: errors.description ? '#EF4444' : (focusedInput === 'desc' ? VIBRANT_GOLD : themeColors.border),
                                            borderWidth: focusedInput === 'desc' ? 2 : 1
                                        }]}
                                        placeholder={isRTL ? 'أضف وصفاً تفصيلياً للمصدر...' : 'Add a detailed description...'}
                                        placeholderTextColor={themeColors.textSecondary}
                                        onBlur={() => { onBlur(); setFocusedInput(null); }}
                                        onFocus={() => setFocusedInput('desc')}
                                        onChangeText={onChange}
                                        value={value}
                                        multiline
                                    />
                                )}
                            />
                            {remainingRequests !== null && (
                                <Text style={{ fontSize: 10, color: themeColors.textSecondary, marginTop: 4, textAlign }}>
                                    {isRTL ? `المتبقي اليوم: ${remainingRequests}/3` : `Remaining today: ${remainingRequests}/3`}
                                </Text>
                            )}
                        </View>

                        <TouchableOpacity style={[styles.mainButton, { flexDirection, backgroundColor: themeColors.primary, marginBottom: 40 }]} onPress={handleSubmit(onSubmit)}>
                            <Text style={[styles.mainButtonText, { color: themeKey === 'dark' ? '#0B1020' : '#FFF' }]}>{t('common.next')}</Text>
                            <Ionicons name={isRTL ? "arrow-back" : "arrow-forward"} size={20} color={themeKey === 'dark' ? '#0B1020' : '#FFF'} />
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Modals for Category, Faculty, Major, Condition */}
            <Modal visible={categoryModalVisible} transparent animationType="slide" onRequestClose={() => setCategoryModalVisible(false)}>
                <Pressable style={styles.modalOverlay} onPress={() => setCategoryModalVisible(false)}>
                    <Pressable style={[styles.modalContent, { backgroundColor: themeColors.background }]} onPress={() => {}}>
                        <View style={[styles.modalHeader, { flexDirection, borderBottomColor: themeColors.border }]}>
                            <Text style={[styles.modalTitle, { color: themeColors.text }]}>{t('categories.title')}</Text>
                            <TouchableOpacity onPress={() => setCategoryModalVisible(false)}>
                                <Ionicons name="close" size={24} color={themeColors.text} />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={RESOURCE_CATEGORIES}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[styles.modalItem, { flexDirection }]}
                                    onPress={() => {
                                        setValue('categoryId', item.id, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
                                        setCategoryModalVisible(false);
                                    }}
                                >
                                    <Ionicons name={item.icon as any} size={22} color={themeColors.primary} style={isRTL ? { marginLeft: 16 } : { marginRight: 16 }} />
                                    <Text style={[styles.modalItemText, { textAlign, color: themeColors.text }]}>{t(`categories.${item.id}`)}</Text>
                                </TouchableOpacity>
                            )}
                            ItemSeparatorComponent={() => <View style={[styles.divider, { backgroundColor: themeColors.border }]} />}
                            contentContainerStyle={{ paddingBottom: 20 }}
                        />
                    </Pressable>
                </Pressable>
            </Modal>
            
            {/* ... Other modals are similarly structured in Data.tsx ... */}
            {/* Faculty Modal */}
            <Modal visible={facultyModalVisible} transparent animationType="slide" onRequestClose={() => setFacultyModalVisible(false)}>
                <Pressable style={styles.modalOverlay} onPress={() => setFacultyModalVisible(false)}>
                    <Pressable style={[styles.modalContent, { backgroundColor: themeColors.background }]} onPress={() => {}}>
                        <View style={[styles.modalHeader, { flexDirection, borderBottomColor: themeColors.border }]}>
                            <Text style={[styles.modalTitle, { color: themeColors.text }]}>{isRTL ? 'اختر الكليات' : 'Select Faculties'}</Text>
                            <TouchableOpacity onPress={() => setFacultyModalVisible(false)}>
                                <Text style={{ color: themeColors.primary, fontWeight: '700' }}>{t('common.save')}</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{ padding: 16, backgroundColor: themeKey === 'dark' ? '#1A1500' : '#FFFBEB' }}>
                            <Text style={{ fontSize: 12, color: themeColors.textSecondary, textAlign, lineHeight: 18 }}>
                                {isRTL 
                                    ? 'يمكنك اختيار أكثر من خيار بناءً على الكليات التي لها علاقة بهذا المصدر.' 
                                    : 'You can select multiple options based on the faculties related to this resource.'}
                            </Text>
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
                                            <Text style={[styles.modalItemText, { textAlign, fontWeight: isSelected ? '800' : '500', color: themeColors.text }]}>
                                                {item.id === 'all' ? (isRTL ? 'إجباري جامعة' : 'University Requirements') : t(`faculties.${item.id}`)}
                                            </Text>
                                            {item.id === 'all' && (
                                                <Text style={[styles.hintText, { textAlign, color: themeColors.textSecondary }]}>{isRTL ? '(إذا كانت المادة متطلب جامعة)' : '(If university requirement)'}</Text>
                                            )}
                                        </View>
                                        {isSelected && <Ionicons name="checkmark-circle" size={24} color="#10B981" />}
                                    </TouchableOpacity>
                                );
                            }}
                            ItemSeparatorComponent={() => <View style={[styles.divider, { backgroundColor: themeColors.border }]} />}
                            contentContainerStyle={{ paddingBottom: 20 }}
                        />
                    </Pressable>
                </Pressable>
            </Modal>

            {/* Major Modal */}
            <Modal visible={majorModalVisible} transparent animationType="slide" onRequestClose={() => setMajorModalVisible(false)}>
                <Pressable style={styles.modalOverlay} onPress={() => setMajorModalVisible(false)}>
                    <Pressable style={[styles.modalContent, { backgroundColor: themeColors.background }]} onPress={() => {}}>
                        <View style={[styles.modalHeader, { flexDirection, borderBottomColor: themeColors.border }]}>
                            <Text style={[styles.modalTitle, { color: themeColors.text }]}>{t('auth.signup.majorLabel')}</Text>
                            <TouchableOpacity onPress={() => setMajorModalVisible(false)}>
                                <Text style={{ color: themeColors.primary, fontWeight: '700' }}>{t('common.save')}</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{ padding: 16, backgroundColor: themeKey === 'dark' ? '#1A1500' : '#FFFBEB' }}>
                            <Text style={{ fontSize: 12, color: themeColors.textSecondary, textAlign, lineHeight: 18 }}>
                                {isRTL 
                                    ? 'يمكنك اختيار أكثر من تخصص بناءً على الكليات المختارة.' 
                                    : 'You can select multiple majors based on the selected faculties.'}
                            </Text>
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
                                        <Text style={[styles.modalItemText, { textAlign, fontWeight: isSelected ? '800' : '500', color: themeColors.text }]}>
                                          {item === 'all' ? (isRTL ? 'الجميع' : 'All') : item}
                                        </Text>
                                        {isSelected && <Ionicons name="checkmark-circle" size={24} color="#10B981" />}
                                    </TouchableOpacity>
                                );
                            }}
                            ItemSeparatorComponent={() => <View style={[styles.divider, { backgroundColor: themeColors.border }]} />}
                            contentContainerStyle={{ paddingBottom: 20 }}
                        />
                    </Pressable>
                </Pressable>
            </Modal>

            {/* Condition Modal */}
            <Modal visible={conditionModalVisible} transparent animationType="slide" onRequestClose={() => setConditionModalVisible(false)}>
                <Pressable style={styles.modalOverlay} onPress={() => setConditionModalVisible(false)}>
                    <Pressable style={[styles.modalContent, { backgroundColor: themeColors.background }]} onPress={() => {}}>
                        <View style={[styles.modalHeader, { flexDirection, borderBottomColor: themeColors.border }]}>
                            <Text style={[styles.modalTitle, { color: themeColors.text }]}>{isRTL ? 'حالة المصدر' : 'Material Condition'}</Text>
                            <TouchableOpacity onPress={() => setConditionModalVisible(false)}>
                                <Ionicons name="close" size={24} color={themeColors.text} />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={BOOK_CONDITIONS}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[styles.modalItem, { flexDirection }]}
                                    onPress={() => {
                                        setValue('conditionId', item.id, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
                                        setConditionModalVisible(false);
                                    }}
                                >
                                    <Ionicons name={item.icon as any} size={22} color={themeColors.primary} style={isRTL ? { marginLeft: 16 } : { marginRight: 16 }} />
                                    <Text style={[styles.modalItemText, { textAlign, color: themeColors.text }]}>{t(`conditions.${item.id}`)}</Text>
                                </TouchableOpacity>
                            )}
                            ItemSeparatorComponent={() => <View style={[styles.divider, { backgroundColor: themeColors.border }]} />}
                            contentContainerStyle={{ paddingBottom: 20 }}
                        />
                    </Pressable>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
};

const local = StyleSheet.create({
    guideBox: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 20,
        gap: 10,
    },
    guideText: {
        fontSize: 13,
        fontWeight: '600',
        flex: 1,
        lineHeight: 18,
    },
    hintText: {
        fontSize: 11,
        fontWeight: '500',
        lineHeight: 16,
    },
});
