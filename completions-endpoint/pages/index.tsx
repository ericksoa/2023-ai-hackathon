// components/HomePage.tsx
import React, { useState } from 'react';
import Codeblock from "@/pages/codeblock";

interface DataSource {
  id: string;
  name: string;
}

const dataSources: DataSource[] = [
  { id: 'covid-data', name: "Covid Data" },
  { id: 'political-contributions' , name: "Political Contribution Data"},
  { id: 'my-company-data', name: "My Company Data" },
]
const HomePage: React.FC = () => {
  const [query, setQuery] = useState('')
  const [dataSource, setDataSource] = useState(dataSources[0].id)
  const [isLoading, setIsLoading] = useState(false)
  const [answer, setAnswer] = useState('')
  const [promptAsk, setPromptAsk] = useState('')
  const [promptStructure, setPromptStructure] = useState('')
  const [promptConditions, setPromptConditions] = useState('')
  const [computeFunction, setComputeFunction] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDataSource(e.target.value);
  };

  const handleAsk = async () => {
    setIsLoading(true);
    const response = await fetch(`/api/hello?subject=${dataSource}&question=${query}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        dataSource,
      }),
    });

    const result = await response.json();
    setAnswer(result.answer)
    setPromptAsk(result.promptAsk)
    setPromptStructure(result.promptStructure)
    setPromptConditions(result.promptConditions)
    setComputeFunction(result.computeFunction)
    setIsLoading(false);
  };

  return (
    <div className="container">
      <h1>Your Own Private GPT</h1>
      <h4>Want to have OpenAI help you search data, without handing your data over? Today we show how to give it enough context to solve the problem without handing over all the data. This is critical for apps like HR</h4>
      <div className="search-box">
        <input
          type="text"
          placeholder="Type your question here..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="query-input"
        />
        <button onClick={handleAsk} disabled={isLoading} className="ask-button">
          Ask
        </button>
        <select value={dataSource} onChange={handleChange} className="data-source">
          {dataSources.map((source) => (
            <option key={source.id} value={source.id}>
              {source.name}
            </option>
          ))}
        </select>
      </div>
      {isLoading && <div className="loading">Thinking...</div>}
      {answer && (
        <div className="answer-section">
          <h2>Answer:</h2>
          <div className="answer-box">{answer}</div>
        </div>
      )}
      {promptStructure && (
        <div className="answer-section">
          <h2>Inferred data structure:</h2>
          <Codeblock code={promptStructure} />
        </div>
      )}
      {computeFunction && (
        <div className="answer-section">
          <h2>Compute Function:</h2>
          <Codeblock code={computeFunction} />
        </div>
      )}
      <style jsx>{`
        .container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          justify-content: center;
          font-family: Arial, sans-serif;
        }
        h1 {
          font-size: 24px;
          margin-bottom: 40px;
        }
        h4 {
          font-size: 10px;
          margin-bottom: 3px;
        }
        .search-box {
          display: flex;
          flex-direction: column;
          gap: 8px;
          align-items: center;
        }
        .query-input {
          width: 600px;
          padding: 12px 20px;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        .ask-button {
          background-color: #4caf50;
          color: white;
          font-size: 14px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          padding: 12px 20px;
        }
        .ask-button:hover {
          background-color: #45a049;
        }
        .data-source {
          width: 200px;
          padding: 8px;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        .loading {
          font-size: 14px;
    }
    .answer-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      width: 100%;
    }
    h2 {
      font-size: 18px;
    }
    .answer-box {
      border: 1px solid #ccc;
      padding: 16px;
      min-height: 100px;
      width: 100%;
      max-width: 600px;
      text-align: left;
      word-wrap: break-word;
    }
  `}</style>
    </div>
  );
};

export default HomePage;