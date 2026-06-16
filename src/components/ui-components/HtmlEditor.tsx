import React, { useRef, useEffect } from 'react';

interface HtmlEditorProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

const HtmlEditor: React.FC<HtmlEditorProps> = ({ value, onChange, className }) => {
    const editorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value) {
            editorRef.current.innerHTML = value;
        }
    }, [value]);

    const handleInput = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    return (
        <>
            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                className={`min-h-[150px] p-3 border rounded-md bg-white overflow-y-auto max-h-[300px] text-sm focus:outline-none focus:ring-1 focus:ring-primary html-editor-preview ${className}`}
                style={{ 
                    lineHeight: '1.4',
                }}
            />
            <style dangerouslySetInnerHTML={{ __html: `
                .html-editor-preview ul {
                    list-style-type: disc !important;
                    margin-left: 1.5rem !important;
                    margin-bottom: 0.5rem !important;
                    display: block !important;
                }
                .html-editor-preview li {
                    margin-bottom: 0.25rem !important;
                    display: list-item !important;
                }
                .html-editor-preview p {
                    margin-bottom: 0.5rem !important;
                }
            ` }} />
        </>
    );
};

export default HtmlEditor;