import React from 'react';
import { DataScreenUI } from './components/DataScreenUI';
import { useAddBookData } from './hooks/useAddBookData';
import { DataScreenProps, UploadPhotoProps } from './types';
import { UploadPhotoUI } from './components/UploadPhotoUI';
import { useUploadPhoto } from './hooks/useUploadPhoto';

export const AddBookDataScreen = (props: DataScreenProps) => {
    const hookData = useAddBookData(props.initialData, props.onNext);
    return <DataScreenUI {...hookData} onBack={props.onBack} />;
};

export const AddBookUploadScreen = (props: UploadPhotoProps) => {
    const hookData = useUploadPhoto(props.initialImage, props.onNext);
    return <UploadPhotoUI {...hookData} />;
};

export * from './types';
export * from './constants';
