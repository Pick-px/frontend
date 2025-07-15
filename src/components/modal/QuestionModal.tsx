import React from 'react';

interface GameQuestion {
  id: string;
  question: string;
  options: string[];
  answer: number;
}

interface QuestionModalProps {
  isOpen: boolean;
  currentQuestion: GameQuestion | null;
  questionTimeLeft: number;
  lives: number;
  selectedAnswer: number | null;
  showResult: boolean;
  isCorrect: boolean;
  setSelectedAnswer: (index: number) => void;
  submitAnswer: () => void;
}

const QuestionModal: React.FC<QuestionModalProps> = ({
  isOpen,
  currentQuestion,
  questionTimeLeft,
  lives,
  selectedAnswer,
  showResult,
  isCorrect,
  setSelectedAnswer,
  submitAnswer,
}) => {
  if (!isOpen || !currentQuestion) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/70'>
      <div className='w-full max-w-md rounded-xl bg-gray-900 p-6 shadow-2xl'>
        <div className='mb-4 flex items-center justify-between'>
          <h3 className='text-xl font-bold text-white'>문제</h3>
          <div className='flex items-center gap-2'>
            {/* 생명 하트 표시 */}
            <div className='flex items-center gap-1'>
              {[...Array(2)].map((_, i) => (
                <div key={i} className='h-6 w-6'>
                  {i < lives ? (
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      viewBox='0 0 24 24'
                      fill='#ef4444'
                      className='h-6 w-6'
                    >
                      <path d='m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z' />
                    </svg>
                  ) : (
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                      strokeWidth={1.5}
                      stroke='#ef4444'
                      className='h-6 w-6'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        d='M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z'
                      />
                    </svg>
                  )}
                </div>
              ))}
            </div>
            <div className='rounded-full bg-red-500 px-3 py-1 text-sm font-bold text-white'>
              {questionTimeLeft}초
            </div>
          </div>
        </div>

        {showResult ? (
          <div
            className={`mb-6 rounded-lg p-4 text-center ${isCorrect ? 'bg-green-500/20' : 'bg-red-500/20'}`}
          >
            <p
              className={`text-2xl font-bold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}
            >
              {isCorrect ? '✅ 정답입니다!' : '❌ 오답입니다!'}
            </p>
            {!isCorrect && (
              <p className='mt-2 text-white'>생명이 1 감소합니다.</p>
            )}
          </div>
        ) : (
          <>
            <p className='mb-6 text-lg text-white'>
              {currentQuestion.question}
            </p>

            <div className='space-y-3'>
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  className={`w-full rounded-lg border border-gray-700 p-3 text-left transition-all ${
                    selectedAnswer === index
                      ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                  onClick={() => setSelectedAnswer(index)}
                >
                  {option}
                </button>
              ))}
            </div>

            <button
              className={`mt-6 w-full rounded-lg py-3 text-center font-bold ${
                selectedAnswer !== null
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                  : 'bg-gray-700 text-gray-400'
              }`}
              onClick={submitAnswer}
              disabled={selectedAnswer === null}
            >
              제출하기
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default QuestionModal;