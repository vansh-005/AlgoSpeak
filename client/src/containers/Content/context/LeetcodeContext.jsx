import React, { createContext, useState, useEffect } from 'react';

export const LeetcodeContext = createContext();

export const LeetcodeProvider = ({ children }) => {
  const [problemData, setProblemData] = useState(null);
  
  useEffect(() => {
    const extractProblemData = () => {
      try {
        const title = document.querySelector('[data-cy="question-title"]')?.textContent || '';
        const description = document.querySelector('.content__u3I1')?.innerText || '';
        const constraints = Array.from(document.querySelectorAll('.question-content__JfgR p'))
          .map(p => p.textContent)
          .join('\n');
        
        let code = '';
        try {
          code = window.monaco.editor.getModels()[0].getValue();
        } catch (e) {
          console.warn('Could not access editor content');
        }
        
        return {
          title,
          description,
          constraints,
          code,
          url: window.location.href
        };
      } catch (error) {
        console.error('Error extracting problem data:', error);
        return null;
      }
    };
    
    // Extract when component mounts
    setProblemData(extractProblemData());
    
    // Update when URL changes (new problem)
    const handleUrlChange = () => {
      setTimeout(() => {
        setProblemData(extractProblemData());
      }, 2000);
    };
    
    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, []);
  
  return (
    <LeetcodeContext.Provider value={problemData}>
      {children}
    </LeetcodeContext.Provider>
  );
};