import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';

import { getPrismicClient } from '../../services/prismic';
import Prismic from '@prismicio/client';
import { RichText } from "prismic-dom";

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { FiCalendar,FiUser,FiClock } from "react-icons/fi";

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';


interface Post {
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
}

export default function Post({ post }:PostProps) {
  const router = useRouter();

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
          <time><FiCalendar size={16}/> {format(new Date(post.first_publication_date), "d MMM uuuu",{  locale: ptBR  })}</time>
          <p><FiUser size={16}/>{post.data.author}</p>
          <p><FiClock size={16}/> {readTimeTotal} min</p>
        </div>

        {post.data.content.map((content) => (
          <div key={content.heading} className={styles.bodyContent}>
            <p className={styles.titleHeading}>
              {content.heading}
            </p>

            <div
              className={styles.bodyText}
              dangerouslySetInnerHTML={{__html:RichText.asHtml(content.body)}}
            />
          </div>
        ))}

      </article>
    </main>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();

  const posts = await prismic.query(
    [
      Prismic.predicates.at('document.type','pos')
    ],
    {
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

export const getStaticProps : GetStaticProps = async context => {

  const prismic = getPrismicClient();

  const slug = context.params.slug;

  const post = await prismic.getByUID('pos',String(slug),{});

  return {
    props : {
      post
    },
    redirect: 60 * 30, // calcular tempo de leitura
  }
};
