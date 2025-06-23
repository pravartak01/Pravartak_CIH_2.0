
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';


import Landing from './Pages/Landing';
import Login from './Pages/auth/Login';
import SignUp from './Pages/auth/SignUp';
 

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
    
            <Router>
              <Routes>
                <Route path="/" element={<Landing />} />
                


                
                {/* Auth Routes */}
                <Route path="/auth/login" element={<Login />} />
                <Route path="/auth/signup" element={<SignUp />} />
                
                {/* 404 Page */}
              </Routes>
              
          
            </Router>
         
    </QueryClientProvider>
  );
}

export default App;
