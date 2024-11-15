import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#fef3d0]">
      {/* Navbar */}
      <nav className="bg-[#f5d3a4] shadow-md fixed top-0 w-full flex justify-between items-center px-4 py-2">
        <div className="text-2xl font-bold text-[#a84e24] flex-1 text-center">Home</div>
        <div className="flex">
          <button onClick={() => navigate('/user-info')} className="text-[#a84e24] hover:text-[#b7572e]">Account</button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-20 px-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/search')}
            className="bg-[#ff9e40] text-white p-6 rounded-lg shadow hover:bg-[#e7890c]"
          >
            Go to Search Page
          </button>
          <button
            onClick={() => navigate('/recipe-book')}
            className="bg-[#6fbf73] text-white p-6 rounded-lg shadow hover:bg-[#52a457]"
          >
            Go to Recipe Book
          </button>
          <button
            onClick={() => navigate('/recipe-maker')}
            className="bg-[#be72c1] text-white p-6 rounded-lg shadow hover:bg-[#a854b2]"
          >
            Go to Recipe Maker
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
