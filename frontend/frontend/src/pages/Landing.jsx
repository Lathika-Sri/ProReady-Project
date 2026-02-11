import React from 'react';
import { Link } from 'react-router-dom';
import { Target, TrendingUp, Brain, Award, ArrowRight } from 'lucide-react';

const Landing = () => {
  const features = [
    {
      icon: <Target size={32} className="text-teal-500" />,
      title: 'Session Tracking',
      description: 'Track your learning sessions across multiple platforms in one place'
    },
    {
      icon: <TrendingUp size={32} className="text-purple-500" />,
      title: 'Analytics & Insights',
      description: 'Get detailed analytics on your preparation time and productivity'
    },
    {
      icon: <Brain size={32} className="text-orange-500" />,
      title: 'AI-Powered Tools',
      description: 'Generate resumes, summarize notes, and create personalized roadmaps'
    },
    {
      icon: <Award size={32} className="text-pink-500" />,
      title: 'Streak Management',
      description: 'Stay motivated with daily streaks and consistency tracking'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Welcome To{' '}
            <span className="bg-gradient-to-r from-teal-500 to-purple-500 bg-clip-text text-transparent">
              ProReady
            </span>
          </h1>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-200 mb-6">
            For Your Career Growth
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-4 max-w-2xl mx-auto">
            ProReady is a smart productivity platform that helps users track learning and career
            preparation in one place.
          </p>
          <p className="text-lg italic text-teal-600 dark:text-teal-400 mb-8">
            "Track your effort. Improve your journey."
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-500 to-purple-500 text-white text-lg font-bold rounded-lg hover:from-teal-600 hover:to-purple-600 transition shadow-lg"
            >
              Get Started
              <ArrowRight size={20} />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-lg font-bold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-lg border-2 border-gray-200 dark:border-gray-700"
            >
              Login
            </Link>
          </div>
        </div>

        {/* Hero Image/Illustration */}
        <div className="mt-16 flex justify-center">
          <div className="relative">
            <div className="w-64 h-64 bg-gradient-to-br from-teal-400 to-purple-400 rounded-full flex items-center justify-center shadow-2xl">
              <div className="w-48 h-48 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-teal-100 dark:bg-teal-900 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-16 h-16 text-teal-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating badges */}
            <div className="absolute -top-4 -right-4 bg-teal-500 text-white px-4 py-2 rounded-full shadow-lg font-semibold">
              Focus
            </div>
            <div className="absolute top-1/2 -right-8 bg-purple-500 text-white px-4 py-2 rounded-full shadow-lg font-semibold">
              Growth
            </div>
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white px-4 py-2 rounded-full shadow-lg font-semibold">
              Track
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
          Why Choose ProReady?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition transform hover:-translate-y-1"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-teal-500 to-purple-500 rounded-2xl shadow-2xl p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of students preparing for placements with ProReady
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-teal-600 text-lg font-bold rounded-lg hover:bg-gray-100 transition shadow-lg"
          >
            Get Started Free
            <ArrowRight size={20} />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p className="text-lg font-semibold mb-2">ProReady</p>
            <p className="text-sm">© 2024 ProReady. All rights reserved.</p>
            <p className="text-sm mt-2">Track your effort. Improve your journey.</p>
            <p className="text-sm mt-2">Built by Lathika Sri ✨</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;