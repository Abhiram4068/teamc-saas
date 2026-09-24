using Microsoft.AspNetCore.Http;
using SaaS.Application.DTOs.Common;
using SaaS.Application.DTOs.Requests;
using SaaS.Application.Interfaces.Service;
using SaaS.Domain.Entities;
using SaaS.Domain.Enums;
using SaaS.Infrastructure.Data;

namespace SaaS.Infrastructure.Services;

public class DocumentService : IDocumentService
{
    private readonly AppDbContext _context;
    private readonly string _storagePath;

    // Known signatures for PDF, PNG, JPEG, XLSX (ZIP), and XLS (CFB)
    private static readonly List<byte[]> _allowedSignatures = new()
    {
        new byte[] { 0x25, 0x50, 0x44, 0x46 }, // PDF
        new byte[] { 0x89, 0x50, 0x4E, 0x47 }, // PNG
        new byte[] { 0xFF, 0xD8, 0xFF },       // JPEG
        new byte[] { 0x50, 0x4B, 0x03, 0x04 }, // XLSX / ZIP
        new byte[] { 0xD0, 0xCF, 0x11, 0xE0 }  // XLS
    };

    public DocumentService(AppDbContext context)
    {
        _context = context;
        
        // Get the documents folder path and if doesnt exists then create one
        _storagePath = Path.Combine(Directory.GetCurrentDirectory(), "documents");
        if (!Directory.Exists(_storagePath))
        {
            Directory.CreateDirectory(_storagePath);
        }
    }

    public async Task<ApiResponse<string>> UploadDocumentAsync(long tenantId, long userId, DocumentUploadRequestDto request)
    {
        if (request.Files == null || request.Files.Count == 0)
        {
            return ApiResponse<string>.FailureResponse("No files were uploaded.", 400);
        }

        long maxSizeInBytes = 100 * 1024 * 1024;
        
        // Loops through all the files in the request
        foreach (var file in request.Files)
        {
            // Validate size (max 100MB)
            if (file.Length > maxSizeInBytes)
            {
                return ApiResponse<string>.FailureResponse($"File {file.FileName} exceeds the maximum limit of 100MB.", 400);
            }

            // Validate file content via Magic Numbers (Signatures)
            bool isValidSignature = false;
            
            // Open the stream for the uploaded file
            using (var readerStream = file.OpenReadStream())
            {
                var headerBytes = new byte[4];
                // Read the first 4 bytes of the file
                await readerStream.ReadAsync(headerBytes, 0, 4);

                // Check if the file header matches any of the allowed signatures
                foreach (var signature in _allowedSignatures)
                {
                    bool match = true;
                    for (int i = 0; i < signature.Length; i++)
                    {
                        if (headerBytes[i] != signature[i])
                        {
                            match = false;
                            break;
                        }
                    }

                    if (match)
                    {
                        isValidSignature = true;
                        break;
                    }
                }
            }

            if (!isValidSignature)
            {
                return ApiResponse<string>.FailureResponse($"Invalid file type for {file.FileName}. Only PDF, Excel, and Images are allowed based on secure content validation.", 400);
            }
            
            // Map the file to a new name with a unique guid
            string mappedFileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
            // Create the file path
            string filePath = Path.Combine(_storagePath, mappedFileName);

            // Copy the file to the file path
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var document = new Document
            {
                DisplayName = string.IsNullOrEmpty(request.DisplayName) ? file.FileName : request.DisplayName,
                Description = request.Description,
                StorageName = mappedFileName,
                ContentType = file.ContentType,
                SizeInBytes = file.Length,
                TenantId = tenantId,
                UserId = userId,
                Status = DocumentStatus.Active,
                UploadedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Documents.Add(document);
        }

        await _context.SaveChangesAsync();

        return ApiResponse<string>.SuccessResponse($"{request.Files.Count} document(s) uploaded successfully.");
    }
}
