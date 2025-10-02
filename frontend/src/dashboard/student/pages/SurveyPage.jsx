import React from 'react';
import SurveyForm from '../components/SurveyForm';

function SurveyPage() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Cognitive & Psychological Survey</h2>
      <p className="mb-6 text-gray-400">
        Please answer the following questions honestly to help us understand your personality traits. 
        This will provide valuable insights for your mentoring journey.
      </p>
      <SurveyForm />
    </div>
  );
}

export default SurveyPage;