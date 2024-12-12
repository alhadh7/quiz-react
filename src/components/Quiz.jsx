import React, { useState, useEffect } from 'react';

const Quiz = () => {
  const [token, setToken] = useState(null);
  const [question, setQuestion] = useState(null);
  const [score, setScore] = useState(null);
  const [isLoginForm, setIsLoginForm] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [answeredQuestions, setAnsweredQuestions] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const registerUser = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://qa-backend-v2gq.onrender.com/api/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        setToken(data.access);
        setError('');
      } else {
        setError('Registration failed. Try again.');
      }
    } catch (err) {
      setError('Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const loginUser = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://qa-backend-v2gq.onrender.com/api/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        setToken(data.access);
        setError('');
      } else {
        setError('Login failed. Invalid credentials.');
      }
    } catch (err) {
      setError('Login failed. Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestion = async () => {
    if (loading) return; // Prevent multiple fetches while loading
    
    try {
      setLoading(true);
      setFeedback(null); // Clear any existing feedback
      
      const response = await fetch('https://qa-backend-v2gq.onrender.com/api/question/', {
        headers: { 
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      
      if (response.status === 404 && data.message === "You have completed all available questions!") {
        setQuizCompleted(true);
        setQuestion(null);
      } else if (response.ok) {
        setQuestion(data);
        setQuizCompleted(false);
      } else {
        setError('Failed to fetch question.');
      }
    } catch (err) {
      setError('Failed to fetch question.');
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async (option) => {
    if (loading || !question) return; // Prevent multiple submissions
    
    try {
      setLoading(true);
      const response = await fetch('https://qa-backend-v2gq.onrender.com/api/submit/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          question_id: question.id,
          selected_option: option,
        }),
      });
      const data = await response.json();
      
      // Update answered questions set
      setAnsweredQuestions(prev => new Set([...prev, question.id]));

      // Set feedback based on response
      if (data.is_correct) {
        setFeedback({
          type: 'success',
          message: 'Correct!',
        });
      } else {
        const correctOptionText = question[`option_${data.correct_option.toLowerCase()}`];
        setFeedback({
          type: 'danger',
          message: `Incorrect! Option ${data.correct_option}: ${correctOptionText} was the correct answer.`
        });
      }
      
      // Update score
      await getSessionDetails();
      
    } catch (err) {
      setError('Failed to submit answer.');
    } finally {
      setLoading(false);
    }
  };

  const getSessionDetails = async () => {
    try {
      const response = await fetch('https://qa-backend-v2gq.onrender.com/api/session/', {
        headers: { 
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setScore(data);
    } catch (err) {
      setError('Failed to fetch session details.');
    }
  };

  const toggleForm = () => {
    setIsLoginForm(!isLoginForm);
    setUsername('');
    setPassword('');
    setError('');
  };

  // Fetch session details when token changes
  useEffect(() => {
    if (token) {
      getSessionDetails();
    }
  }, [token]);

  return (
    <div className="container mb-5 w-100">
      {token && (
        <div className="heading pb-4">
          <h2>QA Session</h2>
        </div>
      )}
      
      <div className="row justify-content-center">
        <div className="col-md-8">
          {!token ? (
            <div className="card">
              <div className="card-header">
                <h2 className="mb-0">{isLoginForm ? 'Login' : 'Sign Up'}</h2>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="mb-3">
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <button
                  onClick={isLoginForm ? loginUser : registerUser}
                  className="btn btn-primary w-100 mb-2"
                  disabled={loading}
                >
                  {loading ? 'Loading...' : (isLoginForm ? 'Login' : 'Sign Up')}
                </button>
                <button
                  onClick={toggleForm}
                  className="btn btn-link w-100"
                  disabled={loading}
                >
                  {isLoginForm ? 'Need an account? Sign Up' : 'Already have an account? Login'}
                </button>
                {error && (
                  <div className="alert alert-danger mt-3" role="alert">
                    {error}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              {!quizCompleted && (
                <div className="card mb-4">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      {!question && !feedback && (
                        <button
                          onClick={fetchQuestion}
                          className="btn btn-primary"
                          disabled={loading}
                        >
                          {loading ? 'Loading...' : 'Get Question'}
                        </button>
                      )}
                      {score && (
                        <div className="text-end">
                          <p className="h5 mb-0">
                            Score: {score.correct_answers}/{score.total_questions}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {feedback && (
                <div className={`alert alert-${feedback.type} mb-3`} role="alert">
                  {feedback.message}
                  <div className="mt-3">
                    <button 
                      onClick={fetchQuestion} 
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      Next Question
                    </button>
                  </div>
                </div>
              )}

              {quizCompleted && (
                <div className="alert alert-info" role="alert">
                  <h4 className="alert-heading">Quiz Completed!</h4>
                  <p>You have answered all available questions.</p>
                  <hr />
                  <p className="mb-0">
                    Final Score: {score?.correct_answers || 0}/{score?.total_questions || 0}
                  </p>
                </div>
              )}

              {question && !feedback && !quizCompleted && (
                <div className="card">
                  <div className="card-body">
                    <h3 className="card-title mb-4">{question.question_text}</h3>
                    <div className="d-grid gap-2">
                      {['A', 'B', 'C', 'D'].map((option) => (
                        <button
                          key={option}
                          onClick={() => submitAnswer(option)}
                          className="btn btn-outline-primary text-start"
                          disabled={loading}
                        >
                          {option}. {question[`option_${option.toLowerCase()}`]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Quiz;
