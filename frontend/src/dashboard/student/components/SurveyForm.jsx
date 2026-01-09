import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitSurvey } from '../../../services/studentService';

const questions = [
  { id: 'Q1', text: 'I am the life of the party.' },
  { id: 'Q2', text: 'I feel little concern for others.' },
  { id: 'Q3', text: 'I am always prepared.' },
  { id: 'Q4', text: 'I get stressed out easily.' },
  { id: 'Q5', text: 'I have a rich vocabulary.' },
  { id: 'Q6', text: 'I don\'t talk a lot.' },
  { id: 'Q7', text: 'I am interested in people.' },
  { id: 'Q8', text: 'I leave my belongings around.' },
  { id: 'Q9', text: 'I am relaxed most of the time.' },
  { id: 'Q10', text: 'I have difficulty understanding abstract ideas.' },
  { id: 'Q11', text: 'I feel comfortable around people.' },
  { id: 'Q12', text: 'I insult people.' },
  { id: 'Q13', text: 'I pay attention to details.' },
  { id: 'Q14', text: 'I worry about things.' },
  { id: 'Q15', text: 'I have a vivid imagination.' },
  { id: 'Q16', text: 'I keep in the background.' },
  { id: 'Q17', text: 'I sympathize with others\' feelings.' },
  { id: 'Q18', text: 'I make a mess of things.' },
  { id: 'Q19', text: 'I seldom feel blue.' },
  { id: 'Q20', text: 'I am not interested in abstract ideas.' },
  { id: 'Q21', text: 'I start conversations.' },
  { id: 'Q22', text: 'I am not interested in other people\'s problems.' },
  { id: 'Q23', text: 'I get chores done right away.' },
  { id: 'Q24', text: 'I am easily disturbed.' },
  { id: 'Q25', text: 'I have excellent ideas.' },
  { id: 'Q26', text: 'I have little to say.' },
  { id: 'Q27', text: 'I have a soft heart.' },
  { id: 'Q28', text: 'I often forget to put things back in their proper place.' },
  { id: 'Q29', text: 'I get upset easily.' },
  { id: 'Q30', text: 'I do not have a good imagination.' },
  { id: 'Q31', text: 'I talk to a lot of different people at parties.' },
  { id: 'Q32', text: 'I am not really interested in others.' },
  { id: 'Q33', text: 'I like order.' },
  { id: 'Q34', text: 'I change my mood a lot.' },
  { id: 'Q35', text: 'I am quick to understand things.' },
  { id: 'Q36', text: 'I don\'t like to draw attention to myself.' },
  { id: 'Q37', text: 'I take time out for others.' },
  { id: 'Q38', text: 'I shirk my duties.' },
  { id: 'Q39', text: 'I have frequent mood swings.' },
  { id: 'Q40', text: 'I use difficult words.' },
  { id: 'Q41', text: 'I don\'t mind being the center of attention.' },
  { id: 'Q42', text: 'I feel others\' emotions.' },
  { id: 'Q43', text: 'I follow a schedule.' },
  { id: 'Q44', text: 'I get irritated easily.' },
  { id: 'Q45', text: 'I spend time reflecting on things.' },
  { id: 'Q46', text: 'I am quiet around strangers.' },
  { id: 'Q47', text: 'I make people feel at ease.' },
  { id: 'Q48', text: 'I am exacting in my work.' },
  { id: 'Q49', text: 'I often feel blue.' },
  { id: 'Q50', text: 'I am full of ideas.' }
];

const answerOptions = [
  { label: 'Strongly Disagree', value: 1 },
  { label: 'Disagree', value: 2 },
  { label: 'Neutral', value: 3 },
  { label: 'Agree', value: 4 },
  { label: 'Strongly Agree', value: 5 },
];

function SurveyForm() {
  const [answers, setAnswers] = useState({});
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: parseInt(value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.keys(answers).length < questions.length) {
      setMessage('Please answer all questions.');
      setIsError(true);
      return;
    }
    setMessage('Submitting your survey...');
    setIsError(false);
    try {
      await submitSurvey(answers);
      setMessage('Survey submitted successfully! Redirecting...');
      setTimeout(() => navigate('/dashboard/student'), 2000);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
      setIsError(true);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg space-y-8">
      {questions.map((q, index) => (
        <div key={q.id} className="border-b border-gray-700 pb-6">
          <p className="font-semibold text-lg">{index + 1}. {q.text}</p>
          <div className="mt-4 max-w-xl">
            <div className="flex justify-between items-center mb-2 text-xs text-gray-400 px-1">
              <span>Strongly Disagree (1)</span>
              <span>Neutral</span>
              <span>Strongly Agree (5)</span>
            </div>
            <div className="flex gap-3">
              {[1, 2, 3, 4, 5].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleAnswerChange(q.id, val)}
                  className={`flex-1 py-3 rounded-md font-bold text-lg transition-all duration-200 border-2 ${answers[q.id] === val
                      ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)] transform scale-105'
                      : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600 hover:border-gray-500 hover:text-white'
                    }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>
        </div>
      ))}
      <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded text-lg">
        Submit My Answers
      </button>
      {message && <p className={`mt-4 text-center font-semibold ${isError ? 'text-red-400' : 'text-green-400'}`}>{message}</p>}
    </form>
  );
}

export default SurveyForm;