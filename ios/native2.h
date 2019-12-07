#ifndef __H_UX_NATIVE2_H__
#define __H_UX_NATIVE2_H__

long create_decoder_l(void);

long start_decoder_l(void);

long pause_decoder_l(void);

long stop_decoder_l(void);

long destroy_decoder_l(void);

long add_decode_item_l(const char **baseUrls, int urlNumber, const char *url,
                       const char *localfile, const char *lessonid,
                       const char *sectionid, long index, int encodetype);

long add_decode_itemEx_l(const char **urls, int urlnumber, const char *localfile,
                         const char *lessonid, const char *sectionid, long index,
                         int encodetype);

long remove_decode_item_l(const char *lessonid);

long prepare_to_decode_l(const char *lid, const char *sid, char **requireurl);

long add_http_header_l(const char *name, const char *value);

long prepare_decode_keys_l(const char *lid, const char *cid, int ctype);

long prepare_decode_keysEx_l(const char *lid, const char **pSectionInfos, int sectionNumber);

long set_sessionid_and_userid(const char *sessionid, const char *userid);

void init_all(void);

long want_to_seek(void);

#endif
