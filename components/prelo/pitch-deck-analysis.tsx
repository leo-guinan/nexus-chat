
interface PitchDeckAnalysisProps {
    pitchDeckAnalysis: string
}

export default function PitchDeckAnalysis({ pitchDeckAnalysis }: PitchDeckAnalysisProps) {
  return (
    <div>
      <h1>Pitch Deck Analysis</h1>
         <div className="text-base leading-6 cursor-text select-all flex flex-row">
                                        <pre className="whitespace-pre-wrap font-sans">
                                            {pitchDeckAnalysis}
                                        </pre>
         </div>
    </div>
  );
}