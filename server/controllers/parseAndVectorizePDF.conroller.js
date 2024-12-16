// import axios from "axios"; // For downloading the PDF
// import pdfParse from "pdf-parse"; // For parsing the PDF
// import { FileData } from "../models/filedata.model.js";
// import { VectorData } from "../models/vectorData.model.js"; // For storing vector data

// export const parseAndVectorizePDF = async (fileId, fileUrl) => {
//   try {
//     console.log(`Processing file with ID: ${fileId}`);

//     // Step 1: Download the PDF
//     const response = await axios.get(fileUrl, { responseType: "arraybuffer", timeout: 5000 });
//     const pdfBuffer = response.data;

//     // console.log(`PDF Buffer size||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||\: ${pdfBuffer.length} bytes`);

//     if (!pdfBuffer || pdfBuffer.length === 0) {
//       throw new Error("Failed to download the PDF file or file is empty.");
//     }

//     // Step 2: Parse the PDF content
//     const pdfData = await pdfParse(pdfBuffer);
//     const pdfText = pdfData?.text;

//     if (!pdfText || pdfText.trim() === "") {
//       throw new Error("PDF parsing failed or produced empty text.");
//     }

//     console.log("Parsed PDF Text done now sending to the textToVector"); // Log a preview of the parsed text

//     // Step 3: Convert the text into a vector format
//     const vector = textToVector(pdfText);

//     if (!vector || vector.length === 0) {
//       throw new Error("Vectorization failed or produced an empty vector.");
//     }

//     console.log("Generated Vector (Preview):", vector.slice(0, 10)); // Log a preview of the vector

//     // Step 4: Save vector data in the VectorData model
//     const vectorData = new VectorData({
//       fileId,
//       vector,
//     });
//     await vectorData.save();

//     // Update the FileData document with the VectorData reference
//     const fileUpdate = await FileData.findByIdAndUpdate(
//       fileId,
//       { vectorData: vectorData._id },
//       { new: true } // Return the updated document
//     );

//     if (!fileUpdate) {
//       throw new Error(`Failed to update FileData with ID: ${fileId}`);
//     }

//     console.log(`Successfully vectorized file with ID: ${fileId}`);
//   } catch (error) {
//     console.error(`Error processing file with ID: ${fileId}`, error.message);
//   }
// };

// // Helper function for text-to-vector conversion
// const textToVector = (text) => {
//   // Replace this with actual vectorization logic
//   const words = text.split(/\s+/);
//   return words.map((word) => word.length); // Example placeholder logic
// };




// import axios from "axios"; // For downloading the PDF
// import pdfParse from "pdf-parse"; // For parsing the PDF
// import { FileData } from "../models/filedata.model.js";
// import { VectorData } from "../models/vectorData.model.js"; // For storing vector data
// import { pipeline } from "@huggingface/transformers"; // For Hugging Face pipeline

// // Load the pre-trained Sentence-BERT model for embeddings
// const model = await pipeline('feature-extraction', 'sentence-transformers/all-MiniLM-L6-v2', {
//   device: 'cpu', // Use 'cuda' for GPU if available
// });


// // Step 1: Convert text to vector (embedding)
// const textToVector = async (text) => {
//   const embeddings = await model(text); // Get embeddings from the model
//   return embeddings[0]; // Extract the first embedding (for the entire text)
// };

// export const parseAndVectorizePDF = async (fileId, fileUrl) => {
//   try {
//     console.log(`Processing file with ID: ${fileId}`);

//     // Step 1: Download the PDF
//     const response = await axios.get(fileUrl, { responseType: "arraybuffer", timeout: 5000 });
//     const pdfBuffer = response.data;

//     if (!pdfBuffer || pdfBuffer.length === 0) {
//       throw new Error("Failed to download the PDF file or file is empty.");
//     }

//     // Step 2: Parse the PDF content
//     const pdfData = await pdfParse(pdfBuffer);
//     const pdfText = pdfData?.text;

//     if (!pdfText || pdfText.trim() === "") {
//       throw new Error("PDF parsing failed or produced empty text.");
//     }

//     console.log("Parsed PDF Text done, now sending to the textToVector");

//     // Step 3: Convert the text into a vector format (embedding)
//     const vector = await textToVector(pdfText);

//     if (!vector || vector.length === 0) {
//       throw new Error("Vectorization failed or produced an empty vector.");
//     }

//     console.log("Generated Vector (Preview):", vector); // Log a preview of the vector

//     // Step 4: Save vector data in the VectorData model
//     const vectorData = new VectorData({
//       fileId,
//       vector,
//     });
//     await vectorData.save();

//     // Update the FileData document with the VectorData reference
//     const fileUpdate = await FileData.findByIdAndUpdate(
//       fileId,
//       { vectorData: vectorData._id },
//       { new: true } // Return the updated document
//     );

//     if (!fileUpdate) {
//       throw new Error(`Failed to update FileData with ID: ${fileId}`);
//     }

//     console.log(`Successfully vectorized file with ID: ${fileId}`);
//   } catch (error) {
//     console.error(`Error processing file with ID: ${fileId}`, error.message);
//   }
// };








import axios from "axios"; // For downloading the PDF
import pdfParse from "pdf-parse"; // For parsing the PDF
import zlib from "zlib"; // For compressing and decompressing vectors
import { FileData } from "../models/filedata.model.js";
import { VectorData } from "../models/vectorData.model.js"; // For storing vector data
import { pipeline } from "@huggingface/transformers"; // For Hugging Face pipeline

// Load the pre-trained Sentence-BERT model for embeddings
const model = await pipeline('feature-extraction', 'sentence-transformers/all-MiniLM-L6-v2', {
  device: 'cpu', // Use 'cuda' for GPU if available
});

// Step 1: Convert text to vector (embedding)
const textToVector = async (text) => {
  const embeddings = await model(text); // Get embeddings from the model
  return embeddings[0]; // Extract the first embedding (for the entire text)
};

// Helper Function: Compress the vector
const compressVector = (vector) => {
  const stringifiedVector = JSON.stringify(vector);
  return zlib.gzipSync(stringifiedVector); // Compress using gzip
};

// Helper Function: Decompress the vector
const decompressVector = (compressedVector) => {
  const decompressed = zlib.gunzipSync(compressedVector).toString();
  return JSON.parse(decompressed); // Parse back to JSON
};

export const parseAndVectorizePDF = async (fileId, fileUrl) => {
  try {
    console.log(`Processing file with ID: ${fileId}`);

    // Step 1: Download the PDF
    const response = await axios.get(fileUrl, { responseType: "arraybuffer", timeout: 5000 });
    const pdfBuffer = response.data;

    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new Error("Failed to download the PDF file or file is empty.");
    }

    // Step 2: Parse the PDF content
    const pdfData = await pdfParse(pdfBuffer);
    const pdfText = pdfData?.text;

    if (!pdfText || pdfText.trim() === "") {
      throw new Error("PDF parsing failed or produced empty text.");
    }

    console.log("Parsed PDF Text done, now sending to the textToVector");

    // Step 3: Convert the text into a vector format (embedding)
    const vector = await textToVector(pdfText);

    if (!vector || vector.length === 0) {
      throw new Error("Vectorization failed or produced an empty vector.");
    }

    console.log("Generated Vector (Preview):", vector.slice(0, 10)); // Log a preview of the vector

    // Step 4: Compress the vector
    const compressedVector = compressVector(vector);

    console.log(`Compressed Vector Size: ${compressedVector.length} bytes`);

    // Step 5: Save compressed vector data in the VectorData model
    const vectorData = new VectorData({
      fileId,
      vector: compressedVector, // Save the compressed vector
    });
    await vectorData.save();

    // Update the FileData document with the VectorData reference
    const fileUpdate = await FileData.findByIdAndUpdate(
      fileId,
      { vectorData: vectorData._id },
      { new: true } // Return the updated document
    );

    if (!fileUpdate) {
      throw new Error(`Failed to update FileData with ID: ${fileId}`);
    }

    console.log(`Successfully vectorized and compressed file with ID: ${fileId}`);
  } catch (error) {
    console.error(`Error processing file with ID: ${fileId}`, error.message);
  }
};

// Usage Example: Retrieve and Decompress Vector
export const getDecompressedVector = async (fileId) => {
  try {
    const vectorData = await VectorData.findOne({ fileId });
    if (!vectorData || !vectorData.vector) {
      throw new Error(`No vector data found for file ID: ${fileId}`);
    }

    const decompressedVector = decompressVector(vectorData.vector);
    console.log("Decompressed Vector (Preview):", decompressedVector.slice(0, 10));
    return decompressedVector;
  } catch (error) {
    console.error(`Error retrieving vector for file ID: ${fileId}`, error.message);
  }
};
