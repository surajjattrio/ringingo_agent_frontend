import Modal from "./Modal";
import { Loader } from "../ui-components";

interface BotLeadInfoModalProps {
  visible: boolean;
  onCancleClick: () => void;
  botData: any;
  isLoading?: boolean;
}

const BotLeadInfoModal = ({ visible, onCancleClick, botData, isLoading }: BotLeadInfoModalProps) => {
  const calls = botData?.calls || [];

  return (
    <Modal
      title="Bot Call History & Detailed Interaction"
      visible={visible}
      onCancleClick={onCancleClick}
      onDoneClick={onCancleClick}
      doneText="Close"
      contentClassName="max-w-[800px] top-[30px] 3xl:top-[50px]"
    >
      <div className="p-0 max-h-[80vh] overflow-y-auto scrollbar-hide bg-gray-50/30">
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-4">
            <Loader />
            <p className="text-gray-500 font-medium animate-pulse">Syncing with AI interaction logs...</p>
          </div>
        ) : calls.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {calls.map((call: any, callIdx: number) => (
              <div key={call.conversation_id || callIdx} className="p-6 bg-white last:mb-0">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <h4 className="text-[#322996] font-bold text-lg leading-tight mb-1">
                      {call.agent_name || "Bot Interaction"}
                    </h4>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-500 font-medium">
                      <span className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-100 rounded-full">
                        ID: {call.conversation_id?.substring(0, 12)}...
                      </span>
                      <span className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-100 rounded-full">
                        {call.start_time_unix_secs ? new Date(call.start_time_unix_secs * 1000).toLocaleString() : "Recent"}
                      </span>
                      {call.call_duration_secs && (
                        <span className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-100 rounded-full">
                          Duration: {Math.floor(call.call_duration_secs / 60)}m {call.call_duration_secs % 60}s
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {call.call_successful && (
                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      call.call_successful === "success" 
                        ? "bg-emerald-100 text-emerald-700" 
                        : "bg-red-100 text-red-700"
                    }`}>
                      {call.call_successful}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-8">
                  {/* Call Summary - Premium Look */}
                  {call.call_summary && (
                    <div className="relative group">
                      <div className="absolute -left-3 top-0 bottom-0 w-1 bg-emerald-400 rounded-full opacity-50 group-hover:opacity-100 transition-opacity"></div>
                      <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-6 h-6 flex items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                          </div>
                          <h5 className="text-emerald-800 font-bold text-xs uppercase tracking-[0.1em]">AI Interaction Summary</h5>
                        </div>
                        <p className="text-sm text-emerald-900/90 leading-relaxed font-normal italic">
                          "{call.call_summary}"
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Transcript - Interactive Chat Look */}
                  {call.transcript && call.transcript.length > 0 && (
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between mb-2">
                         <div className="flex items-center gap-2">
                           <div className="w-6 h-6 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                             <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                           </div>
                           <h5 className="text-gray-500 font-bold text-xs uppercase tracking-[0.1em]">Conversation Transcript</h5>
                         </div>
                         <div className="text-[10px] text-gray-400 font-medium">{call.transcript.length} Messages exchanged</div>
                      </div>
                      
                      <div className="flex flex-col gap-6 relative">
                        {/* Connecting Line */}
                        <div className="absolute left-[20px] top-4 bottom-4 w-px bg-gray-100 hidden md:block"></div>
                        
                        {call.transcript.map((item: any, tIdx: number) => (
                          <div
                            key={tIdx}
                            className={`flex group relative ${
                              item.role === "agent" ? "flex-row" : "flex-row-reverse"
                            }`}
                          >
                            {/* Avatar/Icon logic */}
                            <div className={`hidden md:flex flex-shrink-0 w-10 h-10 rounded-full z-10 items-center justify-center border-2 border-white shadow-sm ${
                              item.role === "agent" ? "bg-[#322996] text-white" : "bg-emerald-600 text-white"
                            }`}>
                              {item.role === "agent" ? (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" /></svg>
                              ) : (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                              )}
                            </div>

                            <div className={`flex flex-col max-w-[85%] md:max-w-[75%] ${
                              item.role === "agent" ? "md:ml-4 items-start" : "md:mr-4 items-end"
                            }`}>
                              <span className={`text-[10px] mb-1 font-bold tracking-tight uppercase ${
                                item.role === "agent" ? "text-[#322996]" : "text-emerald-700"
                              }`}>
                                {item.role === "agent" ? (call.agent_name || "Bot") : (call.user_name || "User")}
                              </span>
                              <div
                                className={`p-4 rounded-2xl shadow-sm text-[13px] leading-relaxed transition-all duration-200 hover:shadow-md ${
                                  item.role === "agent"
                                    ? "bg-white text-gray-800 rounded-tl-none border border-gray-100"
                                    : "bg-[#322996] text-white rounded-tr-none"
                                }`}
                              >
                                {item.message}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <svg
                className="w-10 h-10 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-gray-900 font-bold text-lg mb-2">No interaction history found</h3>
            <p className="text-sm text-gray-400 max-w-[280px] mx-auto leading-relaxed">
              We couldn't find any recorded interaction logs for this lead. This might happen if the call hasn't been finalized yet.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default BotLeadInfoModal;