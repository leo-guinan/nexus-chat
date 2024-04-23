'use client'
import { useState } from 'react';
import {requestSubmind} from "@/app/actions/prelo";

type FormData = {
  investor: string;
  firm: string;
  thesis: string;
  location: string;
  website: string;
  twitter: string;
  linkedin: string;
  crunchbase: string;
  angellist: string;
  interviewTranscript: string;
};

export default function CreateSubmind() {
  const [formData, setFormData] = useState<FormData>({
    investor: '',
    firm: '',
    thesis: '',
    location: '',
    website: '',
    twitter: '',
    linkedin: '',
    crunchbase: '',
    angellist: '',
    interviewTranscript: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await requestSubmind(
        formData.investor,
        formData.firm,
        formData.thesis,
        formData.location,
        formData.website,
        formData.twitter,
        formData.linkedin,
        formData.crunchbase,
        formData.angellist,
        formData.interviewTranscript
    )
    //reset fields
    setFormData({
      investor: '',
      firm: '',
      thesis: '',
      location: '',
      website: '',
      twitter: '',
      linkedin: '',
      crunchbase: '',
      angellist: '',
      interviewTranscript: '',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h1 className="text-xl font-bold">Create Submind Form</h1>
      {Object.keys(formData).map((key) => (
        <div key={key}>
          <label htmlFor={key} className="capitalize">{key}</label>
          <input
            type="text"
            name={key}
            id={key}
            value={formData[key as keyof FormData]}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      ))}
      <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Submit</button>
    </form>
  );
}