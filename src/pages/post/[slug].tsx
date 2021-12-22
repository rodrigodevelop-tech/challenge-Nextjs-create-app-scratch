import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import Link from 'next/dist/client/link';

import { getPrismicClient } from '../../services/prismic';
import Prismic from '@prismicio/client';
import { RichText } from "prismic-dom";

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { FiCalendar,FiUser,FiClock } from "react-icons/fi";

import { format, parseJSON } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';


interface Post {
  id: string;
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
  preview: boolean;
  previousPost?: Post;
  nextPost?: Post;
}

export default function Post({ post, preview,previousPost,nextPost }:PostProps) {
  const router = useRouter();

  // console.log('ANTERIOR##')
  // console.log(previousPost);

  // console.log('NEXT##')
  // console.log(nextPost);

  const totalWords = post.data.content
  .map( content => RichText.asText(content.body).split(' '))
  .reduce((total, text) => {

    total += text.length;
    return total
  }, 0);

  const readTimeTotal = Math.ceil(totalWords / 200);


  if(router.isFallback){
    return <div>Carregando...</div>
  }

  return (
    <main className={commonStyles.container}>
      <div className={styles.banner_img}>
        <img src={post.data.banner.url} alt="Banner" />
      </div>

      <article className={styles.content}>
        <h2>{post.data.title}</h2>

        <div className={styles.header_content}>
          <time>
            <FiCalendar size={16} />{' '}
            {format(new Date(post.first_publication_date), 'd MMM uuuu', {
              locale: ptBR,
            })}
          </time>
          <p>
            <FiUser size={16} />
            {post.data.author}
          </p>
          <p>
            <FiClock size={16} /> {readTimeTotal} min
          </p>
        </div>

        {post.data.content.map(content => (
          <div key={content.heading} className={styles.bodyContent}>
            <p className={styles.titleHeading}>{content.heading}</p>

            <div
              className={styles.bodyText}
              dangerouslySetInnerHTML={{
                __html: RichText.asHtml(content.body),
              }}
            />
          </div>
        ))}

        <div className={styles.linePostFooter}/>

        <div className={styles.navigatePost}>

              {
                previousPost !== null && (
                  <aside  className={styles.previousPost}>
                    <p>{previousPost.data?.title}</p>
                    <Link href={`/post/${previousPost.uid}`} >
                      <a>Post anterior</a>
                    </Link>
                   </aside>
                )
              }

              {
                nextPost !== null && (
                  <aside  className={styles.nextPost}>
                    <p>{nextPost.data?.title}</p>
                    <Link href={`/post/${nextPost.uid}`} >
                      <a>Próximo post</a>
                    </Link>
                  </aside>
                )
              }


        </div>

        {preview && (
          <aside className={commonStyles.exitPreview}>
            <Link href="/api/exit-preview">
              <a>Sair do modo Preview</a>
            </Link>
          </aside>
        )}
      </article>
    </main>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();

  const posts = await prismic.query(
    [
      Prismic.predicates.at('document.type','pos')
    ],
    {
      fetch: ['pos.title', 'pos.subtitle', 'pos.author', 'pos.content'],
      pageSize: 20
    }
  );

  const slugsPosts = posts.results.map( post => (
      {
        params: {
          slug: post.uid,
        }
      }
    ));

  return {
    paths: slugsPosts,
    fallback: true
  }
};

export const getStaticProps : GetStaticProps = async ({ params, preview=false, previewData }) => {

  const prismic = getPrismicClient();

  const slug = params.slug;

  const post = await prismic.getByUID('pos',String(slug),{
    ref: previewData?.ref ?? null,
  }) || {} as Post;

  const previousPostReponse = await prismic.query(
    [
      Prismic.Predicates.at('document.type','pos')
    ],
    {
      pageSize: 1,
      after: `${post.id}`,
      orderings: '[document.first_publication_date desc]'
    }
  );

  const nextPostResponse = await prismic.query(
    [
      Prismic.Predicates.at('document.type','pos')
    ],
    {
      pageSize: 1,
      after: `${post.id}`,
      orderings: '[document.first_publication_date]'
    }
  );

  const previousPost = previousPostReponse.results.length > 0 ? previousPostReponse.results[0] : null;

  const nextPost = nextPostResponse.results.length > 0 ? nextPostResponse.results[0] : null;


  return {
    props : {
      post,
      preview,
      previousPost,
      nextPost
    },
    redirect: 60 * 30, // calcular tempo de leitura
  }
};
