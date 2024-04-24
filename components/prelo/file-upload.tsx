'use client'
import React, {useEffect, useState} from 'react';
import {getUploadUrl} from "@/app/actions/prelo";
import { redirect, useRouter } from 'next/navigation';

const FileUpload: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [uploadUrl, setUploadUrl] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [pitchDeckId, setPitchDeckId] = useState<number | null>(null);
    const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
    const router = useRouter()


    useEffect(() => {
        if(uploadSuccess && pitchDeckId) {
            console.log(pitchDeckId)
            router.push(`/prelo/pitch/${pitchDeckId.toString()}`)
        }
    }, [uploadSuccess, pitchDeckId])

    // Handle file change event from input
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files ? event.target.files[0] : null;

        // Check if the file is a PDF
        if (selectedFile) {
            if (selectedFile.type === 'application/pdf') {
                setLoading(true);
                const newUploadUrl = await getUploadUrl(selectedFile.name);
                console.log(newUploadUrl)
                if ('error' in newUploadUrl) {
                    setErrorMessage('Error getting upload URL. Please try again.');
                    setFile(null);
                    setLoading(false);
                    return;
                }
                setUploadUrl(newUploadUrl.url)
                setPitchDeckId(newUploadUrl.pitchDeckId)
                setFile(selectedFile);
                setErrorMessage('');
                setLoading(false);
            } else {
                setErrorMessage('Please upload a valid PDF file.');
                setFile(null);
            }
        }
    };

    // Function to handle file upload, for example, sending it to a server
    const handleUpload = async () => {
        if (!file) {
            setErrorMessage('Please select a PDF file to upload.');
            return;
        }

        try {
            // Example: POST request using fetch
            const response = await fetch(uploadUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/pdf'  // Must match with the content type used to generate the pre-signed URL
                },
                body: file,
            });

            if (response.ok) {
                console.log('File uploaded successfully');
                setUploadSuccess(true)

                // Handle response here
            } else {
                throw new Error('Failed to upload file');
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            setErrorMessage('Error uploading file. Please try again.');
        }
    };

    return (
        <div>
            <input type="file" accept="application/pdf" onChange={handleFileChange}/>
            {file && <div>Selected File: {file.name}</div>}
            {errorMessage && <div style={{color: 'red'}}>{errorMessage}</div>}
            <button onClick={handleUpload} disabled={!file || loading}>Upload File</button>
        </div>
    );
}

export default FileUpload;
