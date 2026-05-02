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
} from 'react-native';
import { Controller } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { DataStyles as styles } from '../styles';
import { RESOURCE_CATEGORIES, BOOK_CONDITIONS, VIBRANT_GOLD } from '../constants';
import { useAddBookData } from '../hooks/useAddBookData';
import { useAppTheme } from '@/context/ThemeContext';

type DataScreenUIProps = ReturnType<typeof useAddBookData> & {
    onBack: () => void;
};

export const DataScreenUI = (props: DataScreenUIProps) => {
    const { 
        control, handleSubmit, errors, watch, setValue, onSubmit, 
        handleGenerateDescription, aiLoading, remainingRequests,
        facultyModalVisible, setFacultyModalVisible, majorModalVisible, setMajorModalVisible,
        conditionModalVisible, setConditionModalVisible, categoryModalVisible, setCategoryModalVisible,
        selectedFacultyIds, selectedMajors, availableMajorsList, facultyList,
        toggleFaculty, toggleMajor, t, isRTL, onBack 
    } = props;

    const { theme: themeKey } = useAppTheme();
    const themeColors = Colors[themeKey];
    const textAlign = isRTL ? 'right' : 'left';
    const flexDirection = isRTL ? 'row-reverse' : 'row';

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <Text style={[styles.stepLabel, { textAlign, color: themeColors.primary }]}>{isRTL ? 'الخطوة 2 من 4' : 'STEP 2 OF 4'}</Text>

                <View style={[styles.progressContainer, { flexDirection }]}>
                    <View style={{ flexDirection, alignItems: 'center', gap: 12 }}>
                        <TouchableOpacity onPress={onBack} style={styles.backButton}>
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
                                    style={[styles.selector, { flexDirection, backgroundColor: themeKey === 'dark' ? themeColors.card : '#F8FAFC', borderColor: themeColors.border }, errors.categoryId && styles.inputError]}
                                >
                                    <Text style={[styles.selectorText, { color: themeColors.text }, !value && { color: themeColors.textSecondary }]} numberOfLines={1}>
                                        {value ? t(`categories.${value}`) : t('categories.placeholder')}
                                    </Text>
                                    <Ionicons name="chevron-down" size={20} color={themeColors.textSecondary} />
                                </TouchableOpacity>
                            )}
                        />
                    </View>

                    {/* Title */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { textAlign, color: themeColors.text }]}>{isRTL ? 'العنوان' : 'Title'}</Text>
                        <Controller
                            control={control}
                            name="title"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    style={[styles.input, { textAlign, color: themeColors.text, backgroundColor: themeKey === 'dark' ? themeColors.card : '#F8FAFC', borderColor: themeColors.border }, errors.title && styles.inputError]}
                                    placeholder={isRTL ? 'مثلاً: آردوينو أونو أو تلخيص مادة' : 'e.g. Arduino Uno or Summary'}
                                    placeholderTextColor={themeColors.textSecondary}
                                    onBlur={onBlur}
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
                                    style={[styles.input, { textAlign, color: themeColors.text, backgroundColor: themeKey === 'dark' ? themeColors.card : '#F8FAFC', borderColor: themeColors.border }, errors.courseName && styles.inputError]}
                                    placeholder="e.g. ENG101"
                                    placeholderTextColor={themeColors.textSecondary}
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                />
                            )}
                        />
                    </View>

                    {/* Faculty (Multiple) */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { textAlign, color: themeColors.text }]}>
                            {isRTL ? 'اختر الكليات التي لها علاقة بالمصدر' : 'Select faculties related to the resource'}
                        </Text>
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => setFacultyModalVisible(true)}
                            style={[styles.selector, { flexDirection, backgroundColor: themeKey === 'dark' ? themeColors.card : '#F8FAFC', borderColor: themeColors.border }, errors.facultyIds && styles.inputError]}
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
                        <Text style={[styles.label, { textAlign, color: themeColors.text }]}>{isRTL ? 'التخصصات' : 'Majors'}</Text>
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => setMajorModalVisible(true)}
                            disabled={selectedFacultyIds.length === 0}
                            style={[styles.selector, { flexDirection, backgroundColor: themeKey === 'dark' ? themeColors.card : '#F8FAFC', borderColor: themeColors.border }, selectedFacultyIds.length === 0 && { opacity: 0.5 }, errors.majors && styles.inputError]}
                        >
                            <Text style={[styles.selectorText, { color: themeColors.text }, selectedMajors.length === 0 && { color: themeColors.textSecondary }]} numberOfLines={1}>
                                {selectedMajors.length > 0 
                                  ? selectedMajors.map(m => m === 'all' ? (isRTL ? 'جميع التخصصات' : 'All Majors') : m).join(', ')
                                  : (isRTL ? 'اختر تخصصات المصدر' : 'Select resource majors')}
                            </Text>
                            <Ionicons name="chevron-down" size={20} color={themeColors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    {/* Condition */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { textAlign, color: themeColors.text }]}>{isRTL ? 'حالة المصدر' : 'Material Condition'}</Text>
                        <Controller
                            control={control}
                            name="conditionId"
                            render={({ field: { value, onChange } }) => (
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    onPress={() => setConditionModalVisible(true)}
                                    style={[styles.selector, { flexDirection, backgroundColor: themeKey === 'dark' ? themeColors.card : '#F8FAFC', borderColor: themeColors.border }, errors.conditionId && styles.inputError]}
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
                                    style={[styles.input, styles.textArea, { textAlign, color: themeColors.text, backgroundColor: themeKey === 'dark' ? themeColors.card : '#F8FAFC', borderColor: themeColors.border }, errors.description && styles.inputError]}
                                    placeholder={isRTL ? 'أضف وصفاً تفصيلياً للمصدر...' : 'Add a detailed description...'}
                                    placeholderTextColor={themeColors.textSecondary}
                                    onBlur={onBlur}
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

                    <TouchableOpacity style={[styles.mainButton, { flexDirection, backgroundColor: themeColors.primary }]} onPress={handleSubmit(onSubmit)}>
                        <Text style={[styles.mainButtonText, { color: themeKey === 'dark' ? '#0B1020' : '#FFF' }]}>{t('common.next')}</Text>
                        <Ionicons name={isRTL ? "arrow-back" : "arrow-forward"} size={20} color={themeKey === 'dark' ? '#0B1020' : '#FFF'} />
                    </TouchableOpacity>
                </View>
            </ScrollView>

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
