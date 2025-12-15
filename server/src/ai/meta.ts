import { date, z } from "zod";

class metaFormats {
  static metaMainInfo = z.object({
    title: z.string().describe("Title representing the content."),
    subTitle: z
      .string()
      .optional()
      .nullish()
      .describe(
        "Subtitle which compliments the title to give a good representation of the content. Optional."
      ),
    description: z
      .string()
      .describe(
        "This is detailed description of the content. When entire document is not allowed to present, this description is shown to give an idea of what the content is about. Should be concise yet informative."
      ),
    shortDescription: z
      .string()
      .describe(
        "A brief summary of the content. This is usually a few lines long and gives a quick overview of what the content is about. Ideal for previews."
      ),
    keywords: z
      .array(z.string())
      .describe(
        "Keywords associated with the content. These help in searching and categorizing the content effectively."
      ),
    authors: z
      .array(z.string())
      .describe("List of authors who contributed to the content. "),
    publishedDate: z
      .string()
      .nullish()
      .optional()
      .describe(
        "The date when the content was published. Should be in ISO 8601 format."
      ),
  });

  static metaListRole = (userName: string) =>
    z.object({
      role: z
        .string()
        .describe(
          `Role that ${userName} has undertaken in various tasks for the content. e.g., 'Author', 'Engineer', 'Designer', 'Manager' etc.`
        ),
      date: z
        .string()
        .describe(
          `Date when ${userName} undertook this role. Should be in ISO 8601 format.`
        ),
      notes: z.string().describe("Justification or explanation for the role."),
    });

  static metaListRoles = (userName: string) =>
    z.object({
      roles: z
        .array(this.metaListRole(userName))
        .describe(
          `List of roles that ${userName} has undertaken in various tasks for the content and its justification.`
        ),
    });

  static metaSingeSkill = (userName: string) =>
    z.object({
      // skill applied by the user
      name: z
        .string()
        .nonempty()
        .describe(
          `Name of the skill applied by ${userName}. E.g., 'Data Analysis', 'Content Writing', 'Graphic Design', etc.`
        ),
      type_isSoft: z
        .boolean()
        .describe(
          `Indicates whether the skill is a soft skill (true) or a technical/hard skill (false). E.g., Communication is a soft skill, Programming is a hard skill.`
        ),
    });
  static metaListSkills = (userName: string, role: string) =>
    z.object({
      skills: z
        .array(this.metaSingeSkill(userName))
        .describe(
          `List of skills that ${userName} has applied in the role of ${role} for the content. Include both soft and technical skills. List elemental skills that contributed to successful execution of tasks may it be communication, technical expertise, or creative problem-solving.`
        ),
    });
}

export default metaFormats;
