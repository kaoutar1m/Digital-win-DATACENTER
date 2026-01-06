import React, { useState } from 'react';
import BCMPanel from './BCMPanel';

const BCMPage: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <BCMPanel
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
    />
  );
};

export default BCMPage;
