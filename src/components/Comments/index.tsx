import { useEffect } from 'react';

export default function Comments({ commentBoxId }){

  useEffect(()=> {
    const scriptParentNode = document.getElementById(commentBoxId);

    if(!scriptParentNode) return;

    const scriptUtt = document.createElement('script');
    scriptUtt.setAttribute('src','https://utteranc.es/client.js');
    scriptUtt.async =true;
    scriptUtt.setAttribute('repo', 'rodrigodevelop-tech/utterances-comments_spacetraveling');
    scriptUtt.setAttribute('issue-term','url');
    scriptUtt.setAttribute('theme','github-dark');
    scriptUtt.setAttribute('crossorigin','anonymous');

    scriptParentNode.appendChild(scriptUtt);

    return () => {
      scriptParentNode.removeChild(scriptParentNode.firstChild);
    }

  },[commentBoxId]);

  return(
    <div id={commentBoxId} />
  )
}
