/** Bound actual streamed UTF-8 bytes before allocating/parsing the complete body. */
export async function readBoundedTrixBody(request:Request,maxBytes:number) {
  if(Number(request.headers.get('content-length')??0)>maxBytes)throw new Error('TRIX_REQUEST_TOO_LARGE');
  const reader=request.body?.getReader();if(!reader)return '';
  const chunks:Uint8Array[]=[];let size=0;
  try {while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>maxBytes){await reader.cancel();throw new Error('TRIX_REQUEST_TOO_LARGE');}chunks.push(value);}}
  finally {reader.releaseLock();}
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
  return new TextDecoder('utf-8',{fatal:true}).decode(bytes);
}
