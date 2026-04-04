/** Homepage copy + asset URLs — edit here without touching JSX */

export const TYPEWRITER_WORDS = ["Intensity.", "Confidence.", "Next Level.", "Action."] as const

export const INNER_ORBIT_IMAGES = [
  "https://images.pixieset.com/722368201/195eb4aa62920d1aebb5c9ae6cd464cc-xxlarge.jpg",
  "https://images.pixieset.com/859900401/5f93f2ba66d0726926791833f7dbe692-xxlarge.jpg",
  "https://images.pixieset.com/715951501/5396b299927b2b3a4968911b2d3a85e7-xxlarge.jpg",
  "https://images.pixieset.com/871632901/585c4479a797f591c14ed7e758cba431-xxlarge.jpg",
  "https://photos.smugmug.com/Portrait-Photos/Fletcher-Good-Sportraits/i-H227Fn6/2/MPCChkDVvzHKs7PwtchkZJS5dSGxcv9FGvnGRPjpL/5K/Flecther-Good-Senior-Pictureso-04907-5K.jpg",
  "https://photos.smugmug.com/Portrait-Photos/McKenna-and-Lilly-Dance-/i-twdvBPW/2/KKNP64tgx8rdSvtm9SQ9rZscQmNpKmtbVQQcxLGZL/O/Lilly-and-McKenna-Dance-Concept-Shoot-04187.jpg",
] as const

export const OUTER_ORBIT_IMAGES = [
  "https://images.pixieset.com/624474801/cdef43cea818e4c54414b52f4312b83a-xxlarge.jpg",
  "https://images.pixieset.com/191669401/77a938b36babe087114510e9f3e3c02b-xxlarge.jpg",
  "https://photos.smugmug.com/Portrait-Photos/Skyler-Hughes-Gym-Sportraits/i-N4mm4xM/2/KMkrzHC9b54gGS8L3KTp4p8CFvPsDmQQ75DKhzS2m/O/Skyler-Hughes-Gym-Pictures-05785.jpg",
  "https://images.pixieset.com/959553701/75d376a5a00388c0fac6c6f2cf6aacb9-xxlarge.jpg",
  "https://images.pixieset.com/207844401/5273570619420d78c21a562cf647d095-xxlarge.jpg",
  "https://images.pixieset.com/43956318/29f4200f3e1c86a2a3cc47cfc9469fa4-xxlarge.jpg",
  "https://images.pixieset.com/16267019/0f457ca94ae4f8864552f7dd15683541-xxlarge.jpg",
  "https://photos.smugmug.com/Media-Day/Binghamton-Kickline-Media-Day-2025/i-Bndmmn4/1/LPV2BccQNwf6LB6D2jWW2xZ6CVtz439L9mdwf5jJZ/4K/A_C01358-4K.jpg",
  "https://photos.smugmug.com/Portrait-Photos/Skyler-Hughes/i-vzjBHK3/3/KgM7Hr7G2JpQZc5gxqXR6CTkKmS49mj67tdjhtFsp/5K/SON01317-5K.jpg",
] as const

export const JOURNEY_LEGENDARY_IMAGES = {
  pill: "https://images.pixieset.com/16267019/071cb15803f07cd59119eb93a385e9ef-xxlarge.jpg",
  circle: "https://images.pixieset.com/43956318/29f4200f3e1c86a2a3cc47cfc9469fa4-xxlarge.jpg",
} as const

export const JOURNEY_WATERMARK =
  "https://photos.smugmug.com/photos/i-H99Tpfs/0/KJcSB2zzPxzqWQZCDvhpZSmc5RppWjxgdWP8cm2Xp/Ti/i-H99Tpfs-Ti.png"

export const JOURNEY_HEADSHOTS = {
  left: "https://photos.smugmug.com/photos/i-2pFkjBq/0/KjwgmK9ZwFSkb7h3VQj2xJMMwJNnZsWnMNGBTGHkd/X2/i-2pFkjBq-X2.png",
  right: "https://photos.smugmug.com/photos/i-ZrbZc6K/0/NM3LkV9Lr7NZj6DMh3B4MrFH8XHXNMsZQNxCGR4x8/5K/i-ZrbZc6K-5K.png",
} as const

export type ArcServiceId = "media-day" | "sportraits" | "senior-portraits"

export const ARC_NODES: {
  id: string
  /** Single line in resting state */
  title: string
  /** If set, resting title shows two lines (e.g. Senior / Portraits) */
  titleBreak?: [string, string]
  description: string
  service: ArcServiceId
  image: string
  bgPosition?: string
}[] = [
  {
    id: "media",
    title: "Media Days",
    description:
      "High-volume, high-impact media days that make your entire roster look like a D1 program.",
    service: "media-day",
    image:
      "https://images.pixieset.com/17750479/21ae5d8391dade60a1b3feac3b6d49ef-xxlarge.jpg",
    bgPosition: "center 40%",
  },
  {
    id: "sportraits",
    title: "Sportraits",
    description:
      "Cinematic, magazine-quality individual athlete sessions that capture your intensity and skill.",
    service: "sportraits",
    image:
      "https://photos.smugmug.com/Portrait-Photos/Fletcher-Good-Sportraits/i-H227Fn6/2/MPCChkDVvzHKs7PwtchkZJS5dSGxcv9FGvnGRPjpL/5K/Flecther-Good-Senior-Pictureso-04907-5K.jpg",
    bgPosition: "center 10%",
  },
  {
    id: "senior",
    title: "Senior Portraits",
    description:
      "Stand out with dynamic, high-end senior portraits that celebrate your milestone and athletic legacy.",
    service: "senior-portraits",
    image: "https://images.pixieset.com/96941169/c1a9170726cf5532ead9d7a723fe5bce-xxlarge.jpg",
    bgPosition: "center 35%",
  },
]
