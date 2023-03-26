// components/HomePage.tsx
import React, { useState } from 'react';
import Codeblock from '@/pages/codeblock';
import styles from './HomePage.module.css';

interface DataSource {
  id: string;
  name: string;
}

const dataSources: DataSource[] = [
  { id: 'covid-data', name: 'Covid Data' },
  { id: 'political-contributions', name: 'Political Contribution Data' },
  { id: 'my-company-data', name: 'My Company Data' },
];

const HomePage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [dataSource, setDataSource] = useState(dataSources[0].id);
  const [isLoading, setIsLoading] = useState(false);
  const [answer, setAnswer] = useState('');
  const [promptAsk, setPromptAsk] = useState('');
  const [promptStructure, setPromptStructure] = useState('');
  const [promptConditions, setPromptConditions] = useState('');
  const [computeFunction, setComputeFunction] = useState('');

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
    setAnswer(result.answer);
    setPromptAsk(result.promptAsk);
    setPromptStructure(result.promptStructure);
    setPromptConditions(result.promptConditions);
    setComputeFunction(result.computeFunction);
    setIsLoading(false);
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
      <h1 className={styles.title}>Private GPT</h1>
      <h4 className={styles.subtitle}>
        Want to have OpenAI help you search data, without handing your data over to the AI Engine? Today we show how
        to give it enough context to solve the problem without handing over all the data. This is
        critical for apps like HR
      </h4>
      <div className={styles.searchBox}>
        <input
          type="text"
          placeholder="Type your question here..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={styles.queryInput}
        />
        <button onClick={handleAsk} disabled={isLoading} className={styles.askButton}>
          Ask
        </button>
        <select value={dataSource} onChange={handleChange} className={styles.dataSource}>
          {dataSources.map((source) => (
            <option key={source.id} value={source.id}>
              {source.name}
            </option>
          ))}
        </select>
      </div>
      {isLoading && <div className={styles.loading}>Thinking...</div>}
      <div className={styles.answerSection}>
        <div className={styles.results}>
          {answer && (
            <div className={styles.resultCard}>
              <h2 className={styles.sectionTitle}>Answer:</h2>
              <div className={styles.answerBox}>{answer}</div>
            </div>
          )}
          {promptStructure && (
            <div className={styles.resultCard}>
              <h2 className={styles.sectionTitle}>Inferred data structure:</h2>
              <Codeblock code={promptStructure} />
            </div>
          )}
          {computeFunction && (
            <div className={styles.resultCard}>
              <h2 className={styles.sectionTitle}>Compute Function:</h2>
            <Codeblock code={computeFunction} />
            </div>
            )}
        </div>
      </div>
    </div>
    </div>
  );
};

export default HomePage;