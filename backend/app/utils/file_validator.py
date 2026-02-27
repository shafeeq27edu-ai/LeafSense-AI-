from fastapi import UploadFile, HTTPException
import logging

logger = logging.getLogger(__name__)
MAX_SIZE = 5 * 1024 * 1024

async def validate_and_read_image(file: UploadFile) -> bytes:
    if not file.content_type.startswith("image/"):
        logger.warning(f"Invalid file type uploaded: {file.content_type}")
        raise HTTPException(status_code=400, detail="File provided is not an image.")
    
    chunk_size = 64 * 1024
    image_bytes_array = bytearray()
    
    while True:
        chunk = await file.read(chunk_size)
        if not chunk:
            break
        image_bytes_array.extend(chunk)
        if len(image_bytes_array) > MAX_SIZE:
            raise HTTPException(
                status_code=413,
                detail={
                    "detail": "File too large. Maximum size is 5MB.",
                    "code": "FILE_TOO_LARGE"
                }
            )
            
    return bytes(image_bytes_array)
