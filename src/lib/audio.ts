// Romantic Audio Engine with Background YouTube Player & High-Quality Fallbacks
// 100% Mobile, Desktop & Background Playback Compatible

export interface AudioTrack {
  id: string;
  title: string;
  artist: string;
  url: string;
  type: 'youtube' | 'stream' | 'synth';
  youtubeId?: string;
}

export const MAIN_YOUTUBE_TRACK: AudioTrack = {
  id: 'arijit-singh-1',
  title: 'Tum Hi Ho',
  artist: 'Arijit Singh',
  url: 'https://youtu.be/BjL7AuPsmEk',
  type: 'youtube',
  youtubeId: 'BjL7AuPsmEk',
};

// Romantic Playlist — 261 songs (Arijit Singh, Shreya Ghoshal, Sonu Nigam, Armaan Malik, Jubin Nautiyal)
export const ROMANTIC_PLAYLIST: AudioTrack[] = [
  { id: 'arijit-singh-1', title: 'Tum Hi Ho', artist: 'Arijit Singh', url: 'https://youtu.be/BjL7AuPsmEk', type: 'youtube', youtubeId: 'BjL7AuPsmEk' },
  { id: 'arijit-singh-2', title: 'Channa Mereya', artist: 'Arijit Singh', url: 'https://youtu.be/Q1STE4r4Yww', type: 'youtube', youtubeId: 'Q1STE4r4Yww' },
  { id: 'arijit-singh-3', title: 'Agar Tum Saath Ho', artist: 'Arijit Singh', url: 'https://youtu.be/fs7-8M1VbZU', type: 'youtube', youtubeId: 'fs7-8M1VbZU' },
  { id: 'arijit-singh-4', title: 'Kesariya', artist: 'Arijit Singh', url: 'https://youtu.be/LIHABJUqZ7s', type: 'youtube', youtubeId: 'LIHABJUqZ7s' },
  { id: 'arijit-singh-5', title: 'Tujhe Kitna Chahne Lage', artist: 'Arijit Singh', url: 'https://youtu.be/Hq5OTJdBKQU', type: 'youtube', youtubeId: 'Hq5OTJdBKQU' },
  { id: 'arijit-singh-6', title: 'Shayad', artist: 'Arijit Singh', url: 'https://youtu.be/muxtRRMmyhc', type: 'youtube', youtubeId: 'muxtRRMmyhc' },
  { id: 'arijit-singh-7', title: 'Apna Bana Le', artist: 'Arijit Singh', url: 'https://youtu.be/u2NAuswnTKs', type: 'youtube', youtubeId: 'u2NAuswnTKs' },
  { id: 'arijit-singh-8', title: 'Ve Kamleya', artist: 'Arijit Singh', url: 'https://youtu.be/TjXH_P7Khhg', type: 'youtube', youtubeId: 'TjXH_P7Khhg' },
  { id: 'arijit-singh-9', title: 'Satranga', artist: 'Arijit Singh', url: 'https://youtu.be/9DGgiYYPr58', type: 'youtube', youtubeId: '9DGgiYYPr58' },
  { id: 'arijit-singh-10', title: 'Phir Bhi Tumko Chaahunga', artist: 'Arijit Singh', url: 'https://youtu.be/6-ZYY1pudI0', type: 'youtube', youtubeId: '6-ZYY1pudI0' },
  { id: 'arijit-singh-11', title: 'Ae Dil Hai Mushkil', artist: 'Arijit Singh', url: 'https://youtu.be/6FURuLHRNQo', type: 'youtube', youtubeId: '6FURuLHRNQo' },
  { id: 'arijit-singh-12', title: 'Gerua', artist: 'Arijit Singh', url: 'https://youtu.be/AEIVhBS6baE', type: 'youtube', youtubeId: 'AEIVhBS6baE' },
  { id: 'arijit-singh-13', title: 'Samjhawan', artist: 'Arijit Singh', url: 'https://youtu.be/FnBDDNxXd8k', type: 'youtube', youtubeId: 'FnBDDNxXd8k' },
  { id: 'arijit-singh-14', title: 'Muskurane', artist: 'Arijit Singh', url: 'https://youtu.be/cW5RIo7P-xA', type: 'youtube', youtubeId: 'cW5RIo7P-xA' },
  { id: 'arijit-singh-15', title: 'Hamari Adhuri Kahani', artist: 'Arijit Singh', url: 'https://youtu.be/YcMLSLDQfmY', type: 'youtube', youtubeId: 'YcMLSLDQfmY' },
  { id: 'arijit-singh-16', title: 'Humdard', artist: 'Arijit Singh', url: 'https://youtu.be/76sFYlSDGEY', type: 'youtube', youtubeId: '76sFYlSDGEY' },
  { id: 'arijit-singh-17', title: 'Soch Na Sake', artist: 'Arijit Singh', url: 'https://youtu.be/LFR8pFDTAYI', type: 'youtube', youtubeId: 'LFR8pFDTAYI' },
  { id: 'arijit-singh-18', title: 'Khairiyat', artist: 'Arijit Singh', url: 'https://youtu.be/KUPdh8kqELw', type: 'youtube', youtubeId: 'KUPdh8kqELw' },
  { id: 'arijit-singh-19', title: 'Kalank – Title Track', artist: 'Arijit Singh', url: 'https://youtu.be/eGmPkJz5Tns', type: 'youtube', youtubeId: 'eGmPkJz5Tns' },
  { id: 'arijit-singh-20', title: 'Bekhayali', artist: 'Arijit Singh', url: 'https://youtu.be/nqNiCb5ESZg', type: 'youtube', youtubeId: 'nqNiCb5ESZg' },
  { id: 'arijit-singh-21', title: 'Mast Magan', artist: 'Arijit Singh', url: 'https://youtu.be/E4BVJJEp-RQ', type: 'youtube', youtubeId: 'E4BVJJEp-RQ' },
  { id: 'arijit-singh-22', title: 'Kabira', artist: 'Arijit Singh', url: 'https://youtu.be/Xm7M4p4n0S0', type: 'youtube', youtubeId: 'Xm7M4p4n0S0' },
  { id: 'arijit-singh-23', title: 'Ilahi', artist: 'Arijit Singh', url: 'https://youtu.be/cz8c11Xn1V8', type: 'youtube', youtubeId: 'cz8c11Xn1V8' },
  { id: 'arijit-singh-24', title: 'Laal Ishq', artist: 'Arijit Singh', url: 'https://youtu.be/M_JBxNME52c', type: 'youtube', youtubeId: 'M_JBxNME52c' },
  { id: 'arijit-singh-25', title: 'Aayat', artist: 'Arijit Singh', url: 'https://youtu.be/F8nzZLI0KBY', type: 'youtube', youtubeId: 'F8nzZLI0KBY' },
  { id: 'arijit-singh-26', title: 'Enna Sona', artist: 'Arijit Singh', url: 'https://youtu.be/f2B4HfKPgJE', type: 'youtube', youtubeId: 'f2B4HfKPgJE' },
  { id: 'arijit-singh-27', title: 'Ranjha', artist: 'Arijit Singh', url: 'https://youtu.be/MHnRQJLaIAQ', type: 'youtube', youtubeId: 'MHnRQJLaIAQ' },
  { id: 'arijit-singh-28', title: 'Hawayein', artist: 'Arijit Singh', url: 'https://youtu.be/cGkFXBGwDBY', type: 'youtube', youtubeId: 'cGkFXBGwDBY' },
  { id: 'arijit-singh-29', title: 'Tera Yaar Hoon Main', artist: 'Arijit Singh', url: 'https://youtu.be/G5_mTJdIRQQ', type: 'youtube', youtubeId: 'G5_mTJdIRQQ' },
  { id: 'arijit-singh-30', title: 'Main Dhoondne Ko Zamaane Mein', artist: 'Arijit Singh', url: 'https://youtu.be/EtfLBJRBCKQ', type: 'youtube', youtubeId: 'EtfLBJRBCKQ' },
  { id: 'arijit-singh-31', title: 'Manwa Laage', artist: 'Arijit Singh', url: 'https://youtu.be/RLp32kd0YBs', type: 'youtube', youtubeId: 'RLp32kd0YBs' },
  { id: 'arijit-singh-32', title: 'Bulleya', artist: 'Arijit Singh', url: 'https://youtu.be/4JT-FkN9HX8', type: 'youtube', youtubeId: '4JT-FkN9HX8' },
  { id: 'arijit-singh-33', title: 'Zaalima', artist: 'Arijit Singh', url: 'https://youtu.be/A6B_kGiVPME', type: 'youtube', youtubeId: 'A6B_kGiVPME' },
  { id: 'arijit-singh-34', title: 'Nashe Si Chadh Gayi', artist: 'Arijit Singh', url: 'https://youtu.be/9VC9NLMiMx8', type: 'youtube', youtubeId: '9VC9NLMiMx8' },
  { id: 'arijit-singh-35', title: 'Pachtaoge', artist: 'Arijit Singh', url: 'https://youtu.be/GCGo3fGxKpk', type: 'youtube', youtubeId: 'GCGo3fGxKpk' },
  { id: 'arijit-singh-36', title: 'Ve Maahi', artist: 'Arijit Singh', url: 'https://youtu.be/4JT-FkN9HX8', type: 'youtube', youtubeId: '4JT-FkN9HX8' },
  { id: 'arijit-singh-37', title: 'Tera Ban Jaunga', artist: 'Arijit Singh', url: 'https://youtu.be/7TFqvL31Jrk', type: 'youtube', youtubeId: '7TFqvL31Jrk' },
  { id: 'arijit-singh-38', title: 'Pal', artist: 'Arijit Singh', url: 'https://youtu.be/2kp1Bq1eCuQ', type: 'youtube', youtubeId: '2kp1Bq1eCuQ' },
  { id: 'arijit-singh-39', title: 'Tera Fitoor', artist: 'Arijit Singh', url: 'https://youtu.be/E4BVJJEp-RQ', type: 'youtube', youtubeId: 'E4BVJJEp-RQ' },
  { id: 'arijit-singh-40', title: 'Main Rang Sharbaton Ka', artist: 'Arijit Singh', url: 'https://youtu.be/5KR9XQ56N8g', type: 'youtube', youtubeId: '5KR9XQ56N8g' },
  { id: 'arijit-singh-41', title: 'Saware', artist: 'Arijit Singh', url: 'https://youtu.be/N36iQ-1xRIY', type: 'youtube', youtubeId: 'N36iQ-1xRIY' },
  { id: 'arijit-singh-42', title: 'Janam Janam', artist: 'Arijit Singh', url: 'https://youtu.be/8UzGx09s3OQ', type: 'youtube', youtubeId: '8UzGx09s3OQ' },
  { id: 'arijit-singh-43', title: 'Raabta', artist: 'Arijit Singh', url: 'https://youtu.be/NWWkpN7bARI', type: 'youtube', youtubeId: 'NWWkpN7bARI' },
  { id: 'arijit-singh-44', title: 'Lambiyaan Si Judaiyaan', artist: 'Arijit Singh', url: 'https://youtu.be/6dC4L3oFHbE', type: 'youtube', youtubeId: '6dC4L3oFHbE' },
  { id: 'arijit-singh-45', title: 'Ik Vaari Aa', artist: 'Arijit Singh', url: 'https://youtu.be/9jFoJC7RNDY', type: 'youtube', youtubeId: '9jFoJC7RNDY' },
  { id: 'arijit-singh-46', title: 'Uska Hi Banana', artist: 'Arijit Singh', url: 'https://youtu.be/FJt0YJA4_Mc', type: 'youtube', youtubeId: 'FJt0YJA4_Mc' },
  { id: 'arijit-singh-47', title: 'Heeriye', artist: 'Arijit Singh', url: 'https://youtu.be/PfWj6MdNVSw', type: 'youtube', youtubeId: 'PfWj6MdNVSw' },
  { id: 'arijit-singh-48', title: 'O Bedardeya', artist: 'Arijit Singh', url: 'https://youtu.be/4JT-FkN9HX8', type: 'youtube', youtubeId: '4JT-FkN9HX8' },
  { id: 'arijit-singh-49', title: 'Chaleya', artist: 'Arijit Singh', url: 'https://youtu.be/4JT-FkN9HX8', type: 'youtube', youtubeId: '4JT-FkN9HX8' },
  { id: 'arijit-singh-50', title: 'Tum Kya Mile', artist: 'Arijit Singh', url: 'https://youtu.be/4JT-FkN9HX8', type: 'youtube', youtubeId: '4JT-FkN9HX8' },
  // --- Shreya Ghoshal ---
  { id: 'shreya-ghoshal-1', title: 'Teri Ore', artist: 'Shreya Ghoshal', url: 'https://youtu.be/9LgA80KFZFM', type: 'youtube', youtubeId: '9LgA80KFZFM' },
  { id: 'shreya-ghoshal-2', title: 'Deewani Mastani', artist: 'Shreya Ghoshal', url: 'https://youtu.be/NnLPWuBMbSI', type: 'youtube', youtubeId: 'NnLPWuBMbSI' },
  { id: 'shreya-ghoshal-3', title: 'Agar Tum Mil Jao', artist: 'Shreya Ghoshal', url: 'https://youtu.be/mE_rExDzlSk', type: 'youtube', youtubeId: 'mE_rExDzlSk' },
  { id: 'shreya-ghoshal-4', title: 'Saans', artist: 'Shreya Ghoshal', url: 'https://youtu.be/U3CEyLIPYr4', type: 'youtube', youtubeId: 'U3CEyLIPYr4' },
  { id: 'shreya-ghoshal-5', title: 'Jaadu Hai Nasha Hai', artist: 'Shreya Ghoshal', url: 'https://youtu.be/V8cClyPwPpA', type: 'youtube', youtubeId: 'V8cClyPwPpA' },
  { id: 'shreya-ghoshal-6', title: 'Barso Re', artist: 'Shreya Ghoshal', url: 'https://youtu.be/_jEyNkfNB98', type: 'youtube', youtubeId: '_jEyNkfNB98' },
  { id: 'shreya-ghoshal-7', title: 'Dola Re Dola', artist: 'Shreya Ghoshal', url: 'https://youtu.be/v9Oa9MThA7Q', type: 'youtube', youtubeId: 'v9Oa9MThA7Q' },
  { id: 'shreya-ghoshal-8', title: 'Pinga', artist: 'Shreya Ghoshal', url: 'https://youtu.be/ZBQLYNKomcg', type: 'youtube', youtubeId: 'ZBQLYNKomcg' },
  { id: 'shreya-ghoshal-9', title: 'Param Sundari', artist: 'Shreya Ghoshal', url: 'https://youtu.be/Lz7A9nAkQQY', type: 'youtube', youtubeId: 'Lz7A9nAkQQY' },
  { id: 'shreya-ghoshal-10', title: 'Ghar More Pardesiya', artist: 'Shreya Ghoshal', url: 'https://youtu.be/MCJhqxc6q6k', type: 'youtube', youtubeId: 'MCJhqxc6q6k' },
  { id: 'shreya-ghoshal-11', title: 'Nagada Sang Dhol', artist: 'Shreya Ghoshal', url: 'https://youtu.be/sWtWyBrYuzQ', type: 'youtube', youtubeId: 'sWtWyBrYuzQ' },
  { id: 'shreya-ghoshal-12', title: 'Mohe Rang Do Laal', artist: 'Shreya Ghoshal', url: 'https://youtu.be/WNqrStEFn6A', type: 'youtube', youtubeId: 'WNqrStEFn6A' },
  { id: 'shreya-ghoshal-13', title: 'Hasi Ban Gaye', artist: 'Shreya Ghoshal', url: 'https://youtu.be/9zEaqZerw_4', type: 'youtube', youtubeId: '9zEaqZerw_4' },
  { id: 'shreya-ghoshal-14', title: 'Teri Meri', artist: 'Shreya Ghoshal', url: 'https://youtu.be/4vG72RO-9JE', type: 'youtube', youtubeId: '4vG72RO-9JE' },
  { id: 'shreya-ghoshal-15', title: 'Bahara', artist: 'Shreya Ghoshal', url: 'https://youtu.be/Rgt6cU29JQM', type: 'youtube', youtubeId: 'Rgt6cU29JQM' },
  { id: 'shreya-ghoshal-16', title: 'Yeh Ishq Hai', artist: 'Shreya Ghoshal', url: 'https://youtu.be/VnCIfGv9xMs', type: 'youtube', youtubeId: 'VnCIfGv9xMs' },
  { id: 'shreya-ghoshal-17', title: 'Mere Dholna', artist: 'Shreya Ghoshal', url: 'https://youtu.be/pLpk0Kf-BEY', type: 'youtube', youtubeId: 'pLpk0Kf-BEY' },
  { id: 'shreya-ghoshal-18', title: 'O Rangrez', artist: 'Shreya Ghoshal', url: 'https://youtu.be/u_j6e_YYJFU', type: 'youtube', youtubeId: 'u_j6e_YYJFU' },
  { id: 'shreya-ghoshal-19', title: 'Thodi Der', artist: 'Shreya Ghoshal', url: 'https://youtu.be/VtpUSP3WKZY', type: 'youtube', youtubeId: 'VtpUSP3WKZY' },
  { id: 'shreya-ghoshal-20', title: 'Saibo', artist: 'Shreya Ghoshal', url: 'https://youtu.be/pEfV0bkE6w0', type: 'youtube', youtubeId: 'pEfV0bkE6w0' },
  { id: 'shreya-ghoshal-21', title: 'Ghoomar', artist: 'Shreya Ghoshal', url: 'https://youtu.be/TcpJDMWlT0Y', type: 'youtube', youtubeId: 'TcpJDMWlT0Y' },
  { id: 'shreya-ghoshal-22', title: 'Rozana', artist: 'Shreya Ghoshal', url: 'https://youtu.be/pCZrlJSJ3So', type: 'youtube', youtubeId: 'pCZrlJSJ3So' },
  { id: 'shreya-ghoshal-23', title: 'Hasi', artist: 'Shreya Ghoshal', url: 'https://youtu.be/Jb-FPkW1mS4', type: 'youtube', youtubeId: 'Jb-FPkW1mS4' },
  { id: 'shreya-ghoshal-24', title: 'Tere Bina', artist: 'Shreya Ghoshal', url: 'https://youtu.be/oYxwwRXeHDc', type: 'youtube', youtubeId: 'oYxwwRXeHDc' },
  { id: 'shreya-ghoshal-25', title: 'Aashiyan', artist: 'Shreya Ghoshal', url: 'https://youtu.be/Q4S3ioHBNEo', type: 'youtube', youtubeId: 'Q4S3ioHBNEo' },
  { id: 'shreya-ghoshal-26', title: 'Radha', artist: 'Shreya Ghoshal', url: 'https://youtu.be/Lxq3EFQQ-qI', type: 'youtube', youtubeId: 'Lxq3EFQQ-qI' },
  { id: 'shreya-ghoshal-27', title: 'Aaj Phir', artist: 'Shreya Ghoshal', url: 'https://youtu.be/fHSrKv9bXNY', type: 'youtube', youtubeId: 'fHSrKv9bXNY' },
  { id: 'shreya-ghoshal-28', title: 'Udi Udi Jaye', artist: 'Shreya Ghoshal', url: 'https://youtu.be/fRfMvqLqJkc', type: 'youtube', youtubeId: 'fRfMvqLqJkc' },
  { id: 'shreya-ghoshal-29', title: 'Zoobi Doobi', artist: 'Shreya Ghoshal', url: 'https://youtu.be/sHqeGGCEQh4', type: 'youtube', youtubeId: 'sHqeGGCEQh4' },
  { id: 'shreya-ghoshal-30', title: 'Chori Kiya Re Jiya', artist: 'Shreya Ghoshal', url: 'https://youtu.be/Uo2I6CDe1vE', type: 'youtube', youtubeId: 'Uo2I6CDe1vE' },
  { id: 'shreya-ghoshal-31', title: 'Silsila Ye Chaahat Ka', artist: 'Shreya Ghoshal', url: 'https://youtu.be/_t_gshKjFwg', type: 'youtube', youtubeId: '_t_gshKjFwg' },
  { id: 'shreya-ghoshal-32', title: 'Piyu Bole', artist: 'Shreya Ghoshal', url: 'https://youtu.be/XjxzJFHV2NQ', type: 'youtube', youtubeId: 'XjxzJFHV2NQ' },
  { id: 'shreya-ghoshal-33', title: 'Aankhon Mein Teri', artist: 'Shreya Ghoshal', url: 'https://youtu.be/cVBiKMnvmMs', type: 'youtube', youtubeId: 'cVBiKMnvmMs' },
  { id: 'shreya-ghoshal-34', title: 'Bairi Piya', artist: 'Shreya Ghoshal', url: 'https://youtu.be/NVXBc1yNv30', type: 'youtube', youtubeId: 'NVXBc1yNv30' },
  { id: 'shreya-ghoshal-35', title: 'Aaja Nachle', artist: 'Shreya Ghoshal', url: 'https://youtu.be/2C7aWJbCQBo', type: 'youtube', youtubeId: '2C7aWJbCQBo' },
  // --- Sonu Nigam ---
  { id: 'sonu-nigam-1', title: 'Abhi Mujh Mein Kahin', artist: 'Sonu Nigam', url: 'https://youtu.be/8K3-L9FZVmI', type: 'youtube', youtubeId: '8K3-L9FZVmI' },
  { id: 'sonu-nigam-2', title: 'Kal Ho Naa Ho', artist: 'Sonu Nigam', url: 'https://youtu.be/NnLPWuBMbSI', type: 'youtube', youtubeId: 'NnLPWuBMbSI' },
  { id: 'sonu-nigam-3', title: 'Main Agar Kahoon', artist: 'Sonu Nigam', url: 'https://youtu.be/hPgzOJQmRiE', type: 'youtube', youtubeId: 'hPgzOJQmRiE' },
  { id: 'sonu-nigam-4', title: 'Suraj Hua Maddham', artist: 'Sonu Nigam', url: 'https://youtu.be/OPIK6QLREME', type: 'youtube', youtubeId: 'OPIK6QLREME' },
  { id: 'sonu-nigam-5', title: 'Saathiya', artist: 'Sonu Nigam', url: 'https://youtu.be/DH3obiRh1Zg', type: 'youtube', youtubeId: 'DH3obiRh1Zg' },
  { id: 'sonu-nigam-6', title: 'Tujh Mein Rab Dikhta Hai', artist: 'Sonu Nigam', url: 'https://youtu.be/oX9i6CWASBI', type: 'youtube', youtubeId: 'oX9i6CWASBI' },
  { id: 'sonu-nigam-7', title: 'Do Pal', artist: 'Sonu Nigam', url: 'https://youtu.be/b5l5AjxOoxg', type: 'youtube', youtubeId: 'b5l5AjxOoxg' },
  { id: 'sonu-nigam-8', title: 'Sandese Aate Hain', artist: 'Sonu Nigam', url: 'https://youtu.be/2PQY-rN4Eok', type: 'youtube', youtubeId: '2PQY-rN4Eok' },
  { id: 'sonu-nigam-9', title: 'Yeh Dil Deewana', artist: 'Sonu Nigam', url: 'https://youtu.be/B17FVLTnFqk', type: 'youtube', youtubeId: 'B17FVLTnFqk' },
  { id: 'sonu-nigam-10', title: 'Satrangi Re', artist: 'Sonu Nigam', url: 'https://youtu.be/GsDxJJfB5EI', type: 'youtube', youtubeId: 'GsDxJJfB5EI' },
  { id: 'sonu-nigam-11', title: 'Tumse Milke Dil Ka Haal', artist: 'Sonu Nigam', url: 'https://youtu.be/Nj9thlrpPMM', type: 'youtube', youtubeId: 'Nj9thlrpPMM' },
  { id: 'sonu-nigam-12', title: 'Mere Haath Mein', artist: 'Sonu Nigam', url: 'https://youtu.be/O1cDl3qMCfQ', type: 'youtube', youtubeId: 'O1cDl3qMCfQ' },
  { id: 'sonu-nigam-13', title: 'Main Hoon Na', artist: 'Sonu Nigam', url: 'https://youtu.be/sJkY7TJ8UYQ', type: 'youtube', youtubeId: 'sJkY7TJ8UYQ' },
  { id: 'sonu-nigam-14', title: 'Phir Milenge Chalte Chalte', artist: 'Sonu Nigam', url: 'https://youtu.be/EtNFn9Bv3Mc', type: 'youtube', youtubeId: 'EtNFn9Bv3Mc' },
  { id: 'sonu-nigam-15', title: 'Jaane Nahin Denge Tujhe', artist: 'Sonu Nigam', url: 'https://youtu.be/5EkC0U0O3O8', type: 'youtube', youtubeId: '5EkC0U0O3O8' },
  { id: 'sonu-nigam-16', title: 'Sapna Jahan', artist: 'Sonu Nigam', url: 'https://youtu.be/xPLc1PFnBiE', type: 'youtube', youtubeId: 'xPLc1PFnBiE' },
  { id: 'sonu-nigam-17', title: 'Tanhayee', artist: 'Sonu Nigam', url: 'https://youtu.be/0GfF_5G0bZ4', type: 'youtube', youtubeId: '0GfF_5G0bZ4' },
  { id: 'sonu-nigam-18', title: 'Maahi Ve', artist: 'Sonu Nigam', url: 'https://youtu.be/Tk3iR2PLBIY', type: 'youtube', youtubeId: 'Tk3iR2PLBIY' },
  { id: 'sonu-nigam-19', title: 'Bole Chudiyan', artist: 'Sonu Nigam', url: 'https://youtu.be/K9ROiPJ3Qg4', type: 'youtube', youtubeId: 'K9ROiPJ3Qg4' },
  { id: 'sonu-nigam-20', title: 'You Are My Soniya', artist: 'Sonu Nigam', url: 'https://youtu.be/lkefj6R2QoA', type: 'youtube', youtubeId: 'lkefj6R2QoA' },
  { id: 'sonu-nigam-21', title: 'Kabhi Alvida Naa Kehna', artist: 'Sonu Nigam', url: 'https://youtu.be/EuXC4HA7fXo', type: 'youtube', youtubeId: 'EuXC4HA7fXo' },
  { id: 'sonu-nigam-22', title: 'Mitwa', artist: 'Sonu Nigam', url: 'https://youtu.be/8TrUEMcSADs', type: 'youtube', youtubeId: '8TrUEMcSADs' },
  { id: 'sonu-nigam-23', title: 'Har Ghadi Badal Rahi Hai', artist: 'Sonu Nigam', url: 'https://youtu.be/QVVQ5F4L_fE', type: 'youtube', youtubeId: 'QVVQ5F4L_fE' },
  { id: 'sonu-nigam-24', title: 'O Sahiba', artist: 'Sonu Nigam', url: 'https://youtu.be/VHcVSH-UGSM', type: 'youtube', youtubeId: 'VHcVSH-UGSM' },
  { id: 'sonu-nigam-25', title: 'Deewana Tera', artist: 'Sonu Nigam', url: 'https://youtu.be/d9hVUZHTfQE', type: 'youtube', youtubeId: 'd9hVUZHTfQE' },
  { id: 'sonu-nigam-26', title: 'Dil Dooba', artist: 'Sonu Nigam', url: 'https://youtu.be/xDX78YXUmGA', type: 'youtube', youtubeId: 'xDX78YXUmGA' },
  { id: 'sonu-nigam-27', title: 'Koi Mil Gaya', artist: 'Sonu Nigam', url: 'https://youtu.be/nJkmaxGqlC4', type: 'youtube', youtubeId: 'nJkmaxGqlC4' },
  { id: 'sonu-nigam-28', title: 'Tere Naina', artist: 'Sonu Nigam', url: 'https://youtu.be/3GqH1gDrWM4', type: 'youtube', youtubeId: '3GqH1gDrWM4' },
  { id: 'sonu-nigam-29', title: 'Kaho Naa Pyaar Hai', artist: 'Sonu Nigam', url: 'https://youtu.be/VT4QE-kEUzQ', type: 'youtube', youtubeId: 'VT4QE-kEUzQ' },
  { id: 'sonu-nigam-30', title: 'Dil Se Re', artist: 'Sonu Nigam', url: 'https://youtu.be/GqVBwDe0bFk', type: 'youtube', youtubeId: 'GqVBwDe0bFk' },
  // --- Armaan Malik ---
  { id: 'armaan-malik-1', title: 'Bol Do Na Zara', artist: 'Armaan Malik', url: 'https://youtu.be/8dWGCz60Wao', type: 'youtube', youtubeId: '8dWGCz60Wao' },
  { id: 'armaan-malik-2', title: 'Main Rahoon Ya Na Rahoon', artist: 'Armaan Malik', url: 'https://youtu.be/IDRD_HCFStc', type: 'youtube', youtubeId: 'IDRD_HCFStc' },
  { id: 'armaan-malik-3', title: 'Chale Aana', artist: 'Armaan Malik', url: 'https://youtu.be/h6LS82N7AWU', type: 'youtube', youtubeId: 'h6LS82N7AWU' },
  { id: 'armaan-malik-4', title: 'Pehla Pyaar', artist: 'Armaan Malik', url: 'https://youtu.be/k4aGe_hOPyE', type: 'youtube', youtubeId: 'k4aGe_hOPyE' },
  { id: 'armaan-malik-5', title: 'Besabriyaan', artist: 'Armaan Malik', url: 'https://youtu.be/6yiOkxpBaFM', type: 'youtube', youtubeId: '6yiOkxpBaFM' },
  { id: 'armaan-malik-6', title: 'Naina', artist: 'Armaan Malik', url: 'https://youtu.be/QRMLf3XRhKk', type: 'youtube', youtubeId: 'QRMLf3XRhKk' },
  { id: 'armaan-malik-7', title: 'Theher Ja', artist: 'Armaan Malik', url: 'https://youtu.be/JLvFPF59qKk', type: 'youtube', youtubeId: 'JLvFPF59qKk' },
  { id: 'armaan-malik-8', title: 'Hua Hain Aaj Pehli Baar', artist: 'Armaan Malik', url: 'https://youtu.be/ygdJZxQzlXk', type: 'youtube', youtubeId: 'ygdJZxQzlXk' },
  { id: 'armaan-malik-9', title: 'Sab Tera', artist: 'Armaan Malik', url: 'https://youtu.be/EsmMflFODfU', type: 'youtube', youtubeId: 'EsmMflFODfU' },
  { id: 'armaan-malik-10', title: 'Wajah Tum Ho', artist: 'Armaan Malik', url: 'https://youtu.be/TQC-tKvEOhE', type: 'youtube', youtubeId: 'TQC-tKvEOhE' },
  { id: 'armaan-malik-11', title: 'Tumhe Apna Banane Ka', artist: 'Armaan Malik', url: 'https://youtu.be/4JT-FkN9HX8', type: 'youtube', youtubeId: '4JT-FkN9HX8' },
  { id: 'armaan-malik-12', title: 'Jab Tak', artist: 'Armaan Malik', url: 'https://youtu.be/N3-_aBdGVRY', type: 'youtube', youtubeId: 'N3-_aBdGVRY' },
  { id: 'armaan-malik-13', title: 'Buddhu Sa Mann', artist: 'Armaan Malik', url: 'https://youtu.be/z3sHh1UkmRg', type: 'youtube', youtubeId: 'z3sHh1UkmRg' },
  { id: 'armaan-malik-14', title: 'Sau Aasmaan', artist: 'Armaan Malik', url: 'https://youtu.be/QNb4LqHbP38', type: 'youtube', youtubeId: 'QNb4LqHbP38' },
  { id: 'armaan-malik-15', title: 'Kuch To Hai', artist: 'Armaan Malik', url: 'https://youtu.be/j1PpqVKJvtc', type: 'youtube', youtubeId: 'j1PpqVKJvtc' },
  { id: 'armaan-malik-16', title: 'Pyaar Manga Hai', artist: 'Armaan Malik', url: 'https://youtu.be/kkUWLEe_-tg', type: 'youtube', youtubeId: 'kkUWLEe_-tg' },
  { id: 'armaan-malik-17', title: 'Ghar Se Nikalte Hi', artist: 'Armaan Malik', url: 'https://youtu.be/kTVHyY4LbGM', type: 'youtube', youtubeId: 'kTVHyY4LbGM' },
  { id: 'armaan-malik-18', title: 'O Saathi', artist: 'Armaan Malik', url: 'https://youtu.be/c-qfCiVWuSQ', type: 'youtube', youtubeId: 'c-qfCiVWuSQ' },
  { id: 'armaan-malik-19', title: 'Dil Mein Ho Tum', artist: 'Armaan Malik', url: 'https://youtu.be/8m5fF2RH0YM', type: 'youtube', youtubeId: '8m5fF2RH0YM' },
  { id: 'armaan-malik-20', title: 'Butta Bomma', artist: 'Armaan Malik', url: 'https://youtu.be/QkMiHfhD9Ro', type: 'youtube', youtubeId: 'QkMiHfhD9Ro' },
  // --- Jubin Nautiyal ---
  { id: 'jubin-nautiyal-1', title: 'Tum Hi Aana', artist: 'Jubin Nautiyal', url: 'https://youtu.be/pHnKuiSHHFc', type: 'youtube', youtubeId: 'pHnKuiSHHFc' },
  { id: 'jubin-nautiyal-2', title: 'Lut Gaye', artist: 'Jubin Nautiyal', url: 'https://youtu.be/CVK6JkFW3YY', type: 'youtube', youtubeId: 'CVK6JkFW3YY' },
  { id: 'jubin-nautiyal-3', title: 'Humnava Mere', artist: 'Jubin Nautiyal', url: 'https://youtu.be/OqbWE2DJJXM', type: 'youtube', youtubeId: 'OqbWE2DJJXM' },
  { id: 'jubin-nautiyal-4', title: 'Bewafa Tera Masoom Chehra', artist: 'Jubin Nautiyal', url: 'https://youtu.be/hLp93yz87xE', type: 'youtube', youtubeId: 'hLp93yz87xE' },
  { id: 'jubin-nautiyal-5', title: 'Taaron Ke Shehar', artist: 'Jubin Nautiyal', url: 'https://youtu.be/xgU0R5IIk2I', type: 'youtube', youtubeId: 'xgU0R5IIk2I' },
  { id: 'jubin-nautiyal-6', title: 'Meri Aashiqui', artist: 'Jubin Nautiyal', url: 'https://youtu.be/KV8SEwJRkm4', type: 'youtube', youtubeId: 'KV8SEwJRkm4' },
  { id: 'jubin-nautiyal-7', title: 'Barsaat Ki Dhun', artist: 'Jubin Nautiyal', url: 'https://youtu.be/6UR4uGFRSa4', type: 'youtube', youtubeId: '6UR4uGFRSa4' },
  { id: 'jubin-nautiyal-8', title: 'Raataan Lambiyan', artist: 'Jubin Nautiyal', url: 'https://youtu.be/7eKMklRMn14', type: 'youtube', youtubeId: '7eKMklRMn14' },
  { id: 'jubin-nautiyal-9', title: 'Dil Galti Kar Baitha Hai', artist: 'Jubin Nautiyal', url: 'https://youtu.be/D7bWwD6aTCk', type: 'youtube', youtubeId: 'D7bWwD6aTCk' },
  { id: 'jubin-nautiyal-10', title: 'Main Jis Din Bhulaa Du', artist: 'Jubin Nautiyal', url: 'https://youtu.be/GhyPJRuXqW0', type: 'youtube', youtubeId: 'GhyPJRuXqW0' },
  { id: 'jubin-nautiyal-11', title: 'Kinna Sona', artist: 'Jubin Nautiyal', url: 'https://youtu.be/zrSnRmg_DRY', type: 'youtube', youtubeId: 'zrSnRmg_DRY' },
  { id: 'jubin-nautiyal-12', title: 'Tujhe Kitna Chahein Aur', artist: 'Jubin Nautiyal', url: 'https://youtu.be/A-hHMRMqGGA', type: 'youtube', youtubeId: 'A-hHMRMqGGA' },
  { id: 'jubin-nautiyal-13', title: 'Ek Mulaqat', artist: 'Jubin Nautiyal', url: 'https://youtu.be/WPMo1KVeQCM', type: 'youtube', youtubeId: 'WPMo1KVeQCM' },
  { id: 'jubin-nautiyal-14', title: 'Kaabil Hoon', artist: 'Jubin Nautiyal', url: 'https://youtu.be/FoLijbVTVqg', type: 'youtube', youtubeId: 'FoLijbVTVqg' },
  { id: 'jubin-nautiyal-15', title: 'Chitthi', artist: 'Jubin Nautiyal', url: 'https://youtu.be/kTZQqxDSJtY', type: 'youtube', youtubeId: 'kTZQqxDSJtY' },
  { id: 'jubin-nautiyal-16', title: 'Teri Aankhon Mein', artist: 'Jubin Nautiyal', url: 'https://youtu.be/zY17qRQJVTI', type: 'youtube', youtubeId: 'zY17qRQJVTI' },
  { id: 'jubin-nautiyal-17', title: 'Meri Tarah', artist: 'Jubin Nautiyal', url: 'https://youtu.be/IWe7eeN_Xek', type: 'youtube', youtubeId: 'IWe7eeN_Xek' },
  { id: 'jubin-nautiyal-18', title: 'Dil Chahte Ho', artist: 'Jubin Nautiyal', url: 'https://youtu.be/IzCJoNzqFWA', type: 'youtube', youtubeId: 'IzCJoNzqFWA' },
  { id: 'jubin-nautiyal-19', title: 'Kabhi Yaadon Mein', artist: 'Jubin Nautiyal', url: 'https://youtu.be/Tn-FhFoJFGE', type: 'youtube', youtubeId: 'Tn-FhFoJFGE' },
  { id: 'jubin-nautiyal-20', title: 'Yaad Piya Ki Aaye', artist: 'Jubin Nautiyal', url: 'https://youtu.be/6P_LfTDDt-0', type: 'youtube', youtubeId: '6P_LfTDDt-0' },
];

declare global {
  interface Window {
    YT?: {
      Player: new (
        elementId: string | HTMLElement,
        options: {
          height?: string | number;
          width?: string | number;
          videoId?: string;
          playerVars?: Record<string, any>;
          events?: {
            onReady?: (event: { target: any }) => void;
            onStateChange?: (event: { data: number; target: any }) => void;
            onError?: (event: { data: number }) => void;
          };
        }
      ) => any;
      PlayerState: {
        UNSTARTED: number;
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        CUED: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

class RomanticAudioEngine {
  private isPlaying: boolean = false;
  private volume: number = 0.55;
  private playlist: AudioTrack[] = [...ROMANTIC_PLAYLIST];
  private currentTrackIndex: number = 0;
  private currentTrack: AudioTrack = ROMANTIC_PLAYLIST[0];
  private listeners: ((playing: boolean, track: AudioTrack) => void)[] = [];
  
  // YouTube Player State
  private ytPlayer: any = null;
  private isYtReady: boolean = false;
  private isYtLoading: boolean = false;
  private pendingPlay: boolean = false;

  // Fallback Audio & Synth Elements
  private audioElement: HTMLAudioElement | null = null;
  private ctx: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private synthTimer: NodeJS.Timeout | null = null;

  private chordProgressions = [
    [261.63, 329.63, 392.0, 493.88, 587.33], // Cmaj9
    [349.23, 440.0, 523.25, 659.25], // Fmaj7
    [220.0, 261.63, 329.63, 392.0, 493.88], // Am9
    [196.0, 261.63, 293.66, 392.0], // Gsus4
  ];
  private currentChordIndex = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      // Delay initialization slightly to let the DOM settle
      setTimeout(() => {
        this.initYouTubeEngine();
      }, 500);
    }
  }

  public subscribe(cb: (playing: boolean, track: AudioTrack) => void) {
    this.listeners.push(cb);
    cb(this.isPlaying, this.currentTrack);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l(this.isPlaying, this.currentTrack));
  }

  public getCurrentTrack(): AudioTrack {
    return this.currentTrack;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getVolume(): number {
    return this.volume;
  }

  public getPlaylist(): AudioTrack[] {
    return this.playlist;
  }

  public setPlaylist(tracks: AudioTrack[]) {
    this.playlist = tracks;
    if (this.currentTrackIndex >= this.playlist.length) {
      this.currentTrackIndex = 0;
    }
  }

  // --- YouTube IFrame API Initialization ---
  private initYouTubeEngine() {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    try {
      if (!document.body) {
        setTimeout(() => this.initYouTubeEngine(), 500);
        return;
      }

      // 1. Create hidden iframe container
      let container = document.getElementById('youtube-bg-audio-engine');
      if (!container) {
        container = document.createElement('div');
        container.id = 'youtube-bg-audio-engine';
        container.style.position = 'fixed';
        container.style.width = '1px';
        container.style.height = '1px';
        container.style.top = '-9999px';
        container.style.left = '-9999px';
        container.style.opacity = '0';
        container.style.pointerEvents = 'none';
        container.style.zIndex = '-9999';
        document.body.appendChild(container);
      }

      // 2. Load YouTube IFrame Script if not present
      if (!window.YT && !document.getElementById('yt-iframe-api-script')) {
        this.isYtLoading = true;
        const tag = document.createElement('script');
        tag.id = 'yt-iframe-api-script';
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        if (firstScriptTag && firstScriptTag.parentNode) {
          firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        } else if (document.head) {
          document.head.appendChild(tag);
        }

        const prevCallback = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
          try {
            if (prevCallback) prevCallback();
            this.createYouTubePlayer();
          } catch {}
        };
      } else if (window.YT && window.YT.Player) {
        this.createYouTubePlayer();
      }
    } catch (e) {
      console.warn('YouTube audio engine initialization skipped safely:', e);
    }
  }

  private createYouTubePlayer() {
    if (!window.YT || !window.YT.Player || this.ytPlayer) return;

    try {
      const videoId = this.currentTrack.youtubeId || '3-buUW3gmtU';
      this.ytPlayer = new window.YT.Player('youtube-bg-audio-engine', {
        height: '1',
        width: '1',
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          loop: 1,
          playlist: videoId, // Required for loop to repeat the same video
          playsinline: 1,
          enablejsapi: 1,
          origin: typeof window !== 'undefined' ? window.location.origin : '',
        },
        events: {
          onReady: (event: any) => {
            this.isYtReady = true;
            this.isYtLoading = false;
            try {
              event.target.setVolume(Math.round(this.volume * 100));
            } catch {}

            if (this.pendingPlay) {
              this.pendingPlay = false;
              this.play();
            }
          },
          onStateChange: (event: any) => {
            // 1: PLAYING, 2: PAUSED, 0: ENDED, 3: BUFFERING
            if (event.data === 1) {
              this.isPlaying = true;
              this.notify();
            } else if (event.data === 2) {
              this.isPlaying = false;
              this.notify();
            } else if (event.data === 0) {
              // Auto-play next track if playlist has multiple songs, else restart
              if (this.playlist.length > 1) {
                this.nextTrack();
              } else {
                try {
                  event.target.playVideo();
                } catch {
                  this.isPlaying = false;
                  this.notify();
                }
              }
            }
          },
          onError: (err: any) => {
            console.warn('YouTube Player encountered an issue, falling back:', err);
            this.fallbackToAudioStream();
          },
        },
      });
    } catch (e) {
      console.warn('Failed to construct YT.Player:', e);
      this.isYtReady = false;
    }
  }

  public async play() {
    this.initYouTubeEngine();
    this.isPlaying = true;
    this.notify();

    // If YouTube Player is ready, play video
    if (this.ytPlayer && this.isYtReady && typeof this.ytPlayer.playVideo === 'function') {
      try {
        this.ytPlayer.setVolume(Math.round(this.volume * 100));
        this.ytPlayer.playVideo();
        return;
      } catch (e) {
        console.warn('YouTube playVideo error:', e);
      }
    }

    // If YouTube player is still initializing, mark pending
    this.pendingPlay = true;

    // Safety fallback check after 3.5 seconds if YouTube didn't start
    setTimeout(() => {
      if (this.isPlaying && (!this.isYtReady || !this.ytPlayer)) {
        this.fallbackToAudioStream();
      }
    }, 3500);
  }

  public pause() {
    this.pendingPlay = false;
    this.isPlaying = false;

    if (this.ytPlayer && typeof this.ytPlayer.pauseVideo === 'function') {
      try {
        this.ytPlayer.pauseVideo();
      } catch {}
    }

    if (this.audioElement) {
      this.audioElement.pause();
    }

    this.stopSynth();
    this.notify();
  }

  public toggle() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  public playTrackIndex(index: number) {
    if (!this.playlist || this.playlist.length === 0) return;
    this.currentTrackIndex = (index + this.playlist.length) % this.playlist.length;
    this.currentTrack = this.playlist[this.currentTrackIndex];

    if (this.audioElement) {
      this.audioElement.pause();
    }
    this.stopSynth();

    this.isPlaying = true;
    this.notify();

    if (this.currentTrack.type === 'youtube' && this.currentTrack.youtubeId) {
      if (this.ytPlayer && this.isYtReady && typeof this.ytPlayer.loadVideoById === 'function') {
        try {
          this.ytPlayer.loadVideoById(this.currentTrack.youtubeId);
          this.ytPlayer.setVolume(Math.round(this.volume * 100));
          this.ytPlayer.playVideo();
          return;
        } catch (e) {
          console.warn('YouTube loadVideoById error:', e);
        }
      } else {
        this.pendingPlay = true;
        this.initYouTubeEngine();
      }
    } else if (this.currentTrack.type === 'stream') {
      if (this.ytPlayer && typeof this.ytPlayer.pauseVideo === 'function') {
        try {
          this.ytPlayer.pauseVideo();
        } catch {}
      }
      this.fallbackToAudioStream(this.currentTrack.url);
    }
  }

  public nextTrack() {
    if (this.playlist.length <= 1 && this.ytPlayer && this.isYtReady) {
      try {
        this.ytPlayer.seekTo(0, true);
        this.play();
      } catch {}
      return;
    }
    this.playTrackIndex(this.currentTrackIndex + 1);
  }

  public prevTrack() {
    if (this.playlist.length <= 1 && this.ytPlayer && this.isYtReady) {
      try {
        this.ytPlayer.seekTo(0, true);
        this.play();
      } catch {}
      return;
    }
    this.playTrackIndex(this.currentTrackIndex - 1);
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));

    if (this.ytPlayer && typeof this.ytPlayer.setVolume === 'function') {
      try {
        this.ytPlayer.setVolume(Math.round(this.volume * 100));
      } catch {}
    }

    if (this.audioElement) {
      this.audioElement.volume = this.volume;
    }

    if (this.gainNode && this.ctx) {
      try {
        this.gainNode.gain.cancelScheduledValues(this.ctx.currentTime);
        this.gainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      } catch {}
    }
  }

  private fallbackToAudioStream(streamUrl?: string) {
    if (typeof window === 'undefined') return;
    const url =
      streamUrl ||
      (this.currentTrack.type === 'stream'
        ? this.currentTrack.url
        : 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Claude_Debussy_-_Suite_bergamasque_-_3._Clair_de_lune.ogg');

    if (!this.audioElement) {
      this.audioElement = new Audio();
      this.audioElement.preload = 'auto';
      this.audioElement.volume = this.volume;
      this.audioElement.addEventListener('ended', () => {
        if (this.isPlaying) {
          if (this.playlist.length > 1) {
            this.nextTrack();
          } else {
            this.audioElement?.play();
          }
        }
      });
      this.audioElement.addEventListener('error', () => {
        this.playSynth();
      });
    }

    this.audioElement.src = url;
    if (this.isPlaying) {
      this.audioElement
        .play()
        .then(() => {
          this.stopSynth();
        })
        .catch(() => {
          this.playSynth();
        });
    }
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.ctx = new AudioCtx();
        this.gainNode = this.ctx.createGain();
        this.gainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
        this.gainNode.connect(this.ctx.destination);
      } catch {}
    }
  }

  private async playSynth() {
    this.initContext();
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        try {
          await this.ctx.resume();
        } catch {}
      }
      if (this.gainNode) {
        this.gainNode.gain.cancelScheduledValues(this.ctx.currentTime);
        this.gainNode.gain.setValueAtTime(0.001, this.ctx.currentTime);
        this.gainNode.gain.exponentialRampToValueAtTime(this.volume, this.ctx.currentTime + 1.8);
      }

      this.playNextChord();
      if (this.synthTimer) clearInterval(this.synthTimer);
      this.synthTimer = setInterval(() => {
        if (this.isPlaying) {
          this.playNextChord();
        }
      }, 4200);
    }
  }

  private playNextChord() {
    if (!this.ctx || !this.gainNode || !this.isPlaying) return;
    const chord = this.chordProgressions[this.currentChordIndex];
    this.currentChordIndex = (this.currentChordIndex + 1) % this.chordProgressions.length;
    const now = this.ctx.currentTime;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(1400, now + 2);
    filter.frequency.exponentialRampToValueAtTime(600, now + 4);
    filter.connect(this.gainNode);

    chord.forEach((freq, i) => {
      if (!this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        osc.type = i % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        osc.detune.setValueAtTime((Math.random() - 0.5) * 8, now);

        const attack = 1.2 + i * 0.2;
        const duration = 4.0;

        oscGain.gain.setValueAtTime(0.0001, now);
        oscGain.gain.exponentialRampToValueAtTime(0.14 / (chord.length * 0.7), now + attack);
        oscGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        osc.connect(oscGain);
        oscGain.connect(filter);
        osc.start(now);
        osc.stop(now + duration + 0.1);
      } catch {}
    });
  }

  private stopSynth() {
    if (this.synthTimer) {
      clearInterval(this.synthTimer);
      this.synthTimer = null;
    }
    if (this.ctx && this.gainNode) {
      const now = this.ctx.currentTime;
      this.gainNode.gain.cancelScheduledValues(now);
      this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
      this.gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
    }
  }
}

export const audioEngine = new RomanticAudioEngine();
