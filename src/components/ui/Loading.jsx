import { motion } from "framer-motion";

const Loading = ({ type = "default" }) => {
  if (type === "table") {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-gray-200">
            <div className="w-10 h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full shimmer"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded shimmer" style={{width: '60%'}}></div>
              <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded shimmer" style={{width: '80%'}}></div>
            </div>
            <div className="w-20 h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded shimmer"></div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "cards") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm"
          >
            <div className="space-y-4">
              <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded shimmer" style={{width: '70%'}}></div>
              <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded shimmer" style={{width: '90%'}}></div>
              <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded shimmer" style={{width: '60%'}}></div>
              <div className="flex justify-between items-center">
                <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded shimmer" style={{width: '40%'}}></div>
                <div className="h-8 w-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded shimmer"></div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  if (type === "pipeline") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-surface rounded-lg p-4">
            <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded shimmer mb-4" style={{width: '60%'}}></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded shimmer mb-2" style={{width: '80%'}}></div>
                  <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded shimmer mb-2" style={{width: '60%'}}></div>
                  <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded shimmer" style={{width: '40%'}}></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading...</p>
      </motion.div>
    </div>
  );
};

export default Loading;