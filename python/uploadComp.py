"""
uploadComp.py is uploads the results of cross_graphs.py

Ussage:

uploadComp.py url filename

where url is the instance of inspectra to upload to and filename is the path to the comp to upload.

"""
import sys
import os
import httplib
import urllib
import urlparse
import exceptions
import socket
supporttls = True
try:
    import ssl
except ImportError:
    supporttls = False
    print "Error importing ssl module. Https will not be supported."

class HTTPSTLSv1Connection(httplib.HTTPConnection):
        """This class allows communication via TLS, it is version of httplib.HTTPSConnection that specifies TLSv1."""

        default_port = httplib.HTTPS_PORT

        def __init__(self, host, port=None, key_file=None, cert_file=None,
                     strict=None, timeout=socket._GLOBAL_DEFAULT_TIMEOUT):
            httplib.HTTPConnection.__init__(self, host, port, strict, timeout)
            self.key_file = key_file
            self.cert_file = cert_file

        def connect(self):
            """Connect to a host on a given (TLS) port."""

            sock = socket.create_connection((self.host, self.port),
                                            self.timeout)
            if self._tunnel_host:
                self.sock = sock
                self._tunnel()
            self.sock = ssl.wrap_socket(sock, self.key_file, self.cert_file, False, ssl.CERT_NONE, ssl.PROTOCOL_TLSv1)

def encode_multipart_formdata(data, filebody, filename):
    """multipart encodes a form. data should be a dictionary of the the form fields and filebody
    should be a string of the body of the file"""
    BOUNDARY = '----------ThIs_Is_tHe_bouNdaRY_$'
    CRLF = '\r\n'
    L = []
    for key, value in data.iteritems():
        L.append('--' + BOUNDARY)
        L.append('Content-Disposition: form-data; name="%s"' % key)
        L.append('')
        L.append(value)
    if filebody != "":
        L.append('--' + BOUNDARY)
        L.append('Content-Disposition: form-data; name="graph"; filename="%s"'%(filename))
        L.append('Content-Type: text/plain')
        L.append('')
        L.append(filebody)
    L.append('--' + BOUNDARY + '--')
    L.append('')
    body = CRLF.join(L)
    content_type = 'multipart/form-data; boundary=%s' % BOUNDARY
    return content_type, body

def doPost(url, paramMap, jsondata, filename,loud=True):
    """
    posts a multipart form to url, paramMap should be a dictionary of the form fields, json data
    should be a string of the body of the file (json in our case) and password should be the password
    to include in the header
    """

    u = urlparse.urlparse(url)
    content_type, body = encode_multipart_formdata(paramMap, jsondata, filename)
    headers = {"Content-type": content_type,
        'content-length': str(len(body)),
        "Accept": "text/plain"
    }

    if loud:
        print "scheme: %s host: %s port: %s" % (u.scheme, u.hostname, u.port)

    if u.scheme == "http":
        conn = httplib.HTTPConnection(u.hostname, u.port)
    else:
        conn = HTTPSTLSv1Connection(u.hostname, u.port)  #,privateKey=key,certChain=X509CertChain([cert]))

    try:
        conn.request("POST", u.path, body, headers)
    except ssl.SSLError:
        print "Ssl error. Did you mean to specify 'http://'?"

    output = None
    resp = conn.getresponse()
    if resp.status == 200:
        print "got 200"
        output = resp.read()
        if loud:
            try:
                print json.dumps(json.JSONDecoder().decode(output), sort_keys=True, indent=4)
            except:
                print output
    elif loud:
        print resp.status, resp.reason

    return resp, output

def uploadGraph(url, filename):
    """
    Upload a grpah comp specified by filename to the instance of inspectra specified by url
    """
    fo = open(filename)
    return doPost(os.path.join(url,"upload"), {},fo.read(),os.path.basename(filename))

def main():
    print uploadGraph(sys.argv[1],sys.argv[2])

if __name__ == '__main__':
    main()