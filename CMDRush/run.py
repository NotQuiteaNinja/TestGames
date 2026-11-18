from pathlib import Path
import argparse,json,re,threading,webbrowser
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
ROOT=Path(__file__).resolve().parent
INFO=json.loads((ROOT/'release.json').read_text(encoding='utf8'))
class Handler(SimpleHTTPRequestHandler):
    extensions_map={**SimpleHTTPRequestHandler.extensions_map,'.wasm':'application/wasm','.mjs':'application/javascript','.js':'application/javascript','.mp3':'audio/mpeg'}
    def __init__(self,*a,**kw):super().__init__(*a,directory=str(ROOT),**kw)
    def end_headers(self):self.send_header('Cache-Control','no-cache');super().end_headers()
    def list_directory(self,path):self.send_error(404);return None
    def log_message(self,*a):pass
    def send_head(self):
        self.remaining=None
        path=Path(self.translate_path(self.path))
        if not path.is_file():return super().send_head()
        try:stream=path.open('rb')
        except OSError:self.send_error(404);return None
        size=path.stat().st_size;start=0;end=size-1;requested=self.headers.get('Range')
        if requested:
            match=re.fullmatch(r'bytes=(\d*)-(\d*)',requested.strip())
            if match and (match[1] or match[2]):
                start=int(match[1]) if match[1] else max(0,size-int(match[2]))
                end=min(size-1,int(match[2])) if match[1] and match[2] else size-1
            else:start=size
            if start>=size or start>end:
                stream.close();self.send_response(416);self.send_header('Content-Range',f'bytes */{size}');self.send_header('Content-Length','0');self.end_headers();return None
        self.send_response(206 if requested else 200);self.send_header('Content-Type',self.guess_type(str(path)));self.send_header('Accept-Ranges','bytes')
        self.remaining=max(0,end-start+1);self.send_header('Content-Length',str(self.remaining));self.send_header('Last-Modified',self.date_time_string(path.stat().st_mtime))
        if requested:self.send_header('Content-Range',f'bytes {start}-{end}/{size}')
        self.end_headers();stream.seek(start);return stream
    def copyfile(self,source,outputfile):
        try:
            if self.remaining is None:return super().copyfile(source,outputfile)
            while self.remaining:
                chunk=source.read(min(65536,self.remaining))
                if not chunk:break
                outputfile.write(chunk);self.remaining-=len(chunk)
        except ConnectionError:pass # Closing a tab cancels audio downloads.
if __name__=='__main__':
    p=argparse.ArgumentParser(description=INFO['name']);p.add_argument('--port',type=int,default=INFO['port']);p.add_argument('--no-browser',action='store_true');args=p.parse_args()
    try:server=ThreadingHTTPServer(('127.0.0.1',args.port),Handler)
    except OSError as e:raise SystemExit(f'Port {args.port} is unavailable. Close the existing game server or choose --port. {e}')
    url=f'http://127.0.0.1:{args.port}/';print(f"{INFO['name']}: {url}\nKeep this window open. Ctrl+C stops the game server.",flush=True)
    if not args.no_browser:threading.Timer(.4,lambda:webbrowser.open(url)).start()
    try:server.serve_forever()
    except KeyboardInterrupt:pass
    finally:server.server_close()
