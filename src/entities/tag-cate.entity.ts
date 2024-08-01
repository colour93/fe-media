import { Column, Entity, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { Tag } from "./tag.entity";

@Entity()
export class TagCate {

  @PrimaryGeneratedColumn()
  cid: number;

  @PrimaryColumn()
  name: string;

  @Column({
    nullable: true
  })
  displayName?: string

  @Column({
    default: 'gray'
  })
  color?: string;

  @OneToMany(() => Tag, tag => tag.cate, { cascade: true, onDelete: 'CASCADE' })
  tags: Tag[];

}