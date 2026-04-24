import React from 'react';
import { View, TextInput, StyleSheet, FlatList, Text, TouchableOpacity, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Radius, Spacing } from '@/constants/theme';
import { SearchBarProps } from '../types';

export const SearchBar: React.FC<SearchBarProps> = ({ 
  query, 
  onQueryChange, 
  predictions, 
  onPredictionSelect, 
  isRTL, 
  theme,
  placeholder
}) => {
  const flexDirection = isRTL ? 'row-reverse' : 'row';
  const textAlign = isRTL ? 'right' : 'left';

  return (
    <View style={styles.container}>
      <View style={[styles.searchBox, { flexDirection, backgroundColor: theme.surface }]}>
        <Ionicons name="search" size={20} color={theme.textSecondary} />
        <TextInput
          style={[styles.input, { textAlign, color: theme.text }]}
          placeholder={placeholder}
          placeholderTextColor={theme.textSecondary}
          value={query}
          onChangeText={onQueryChange}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => onQueryChange('')}>
            <Ionicons name="close-circle" size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
      
      {predictions.length > 0 && (
        <View style={[styles.predictions, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {predictions.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={[styles.predictionItem, { flexDirection, borderBottomColor: theme.border }]}
              onPress={() => onPredictionSelect(item)}
            >
              <Ionicons name="time-outline" size={16} color={theme.textSecondary} />
              <Text style={[styles.predictionText, { color: theme.text, textAlign }]} numberOfLines={1}>
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
    zIndex: 1000,
  },
  searchBox: {
    height: 54,
    borderRadius: Radius.md,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  predictions: {
    position: 'absolute',
    top: 58,
    left: 0,
    right: 0,
    borderRadius: Radius.md,
    borderWidth: 1,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    zIndex: 2000,
  },
  predictionItem: {
    padding: 14,
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
  },
  predictionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
});
