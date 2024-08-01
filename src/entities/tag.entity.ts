import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { TagCate } from "./tag-cate.entity";
import { Video } from "./video.entity";

@Entity()
export class Tag {

  @PrimaryGeneratedColumn()
  cid: number;

  @PrimaryColumn()
  name: string;

  @ManyToOne(() => TagCate, tagCate => tagCate.tags, { onDelete: 'CASCADE' })
  @JoinColumn()
  cate: TagCate;

  @ManyToMany(() => Video, video => video.tags)
  @JoinTable()
  videos: Video[];

  @Column({
    nullable: true
  })
  displayName?: string;

  @Column({
    nullable: true
  })
  description?: string;

  @Column({
    nullable: true
  })
  cover?: string;

}